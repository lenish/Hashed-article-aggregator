from flask import Blueprint, jsonify, request
from app.models.article import Article
from app.models.user import User
from app import db
from app.routes.auth import token_required
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('articles', __name__, url_prefix='/api/articles')

@bp.route('/', methods=['GET'])
def get_articles():
    """기사 목록 조회 (리스크 관리 필터 포함)"""
    try:
        # 쿼리 파라미터
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category', None)
        source = request.args.get('source', None)
        date_from = request.args.get('date_from', None)
        date_to = request.args.get('date_to', None)
        keyword = request.args.get('keyword', None)
        sentiment = request.args.get('sentiment', None)
        needs_response = request.args.get('needs_response', None)
        # 리스크 관리 필터
        risk_level = request.args.get('risk_level', None)
        status = request.args.get('status', None)
        assignee_id = request.args.get('assignee_id', None, type=int)
        exclude_resolved = request.args.get('exclude_resolved', None)

        # 기본 쿼리: 해시드 관련 기사만
        query = Article.query.filter_by(is_medical=True)

        # 카테고리 필터
        if category:
            query = query.filter_by(category=category)

        # 언론사 필터
        if source:
            query = query.filter(Article.source.ilike(f'%{source}%'))

        # 날짜 필터 (시작)
        if date_from:
            try:
                date_obj = datetime.fromisoformat(date_from)
                query = query.filter(Article.published_date >= date_obj)
            except ValueError:
                return jsonify({'error': '잘못된 날짜 형식 (date_from)'}), 400

        # 날짜 필터 (종료)
        if date_to:
            try:
                date_obj = datetime.fromisoformat(date_to)
                # 해당 날짜의 끝까지 포함
                date_obj = date_obj + timedelta(days=1)
                query = query.filter(Article.published_date < date_obj)
            except ValueError:
                return jsonify({'error': '잘못된 날짜 형식 (date_to)'}), 400

        # 키워드 필터 (제목 또는 설명에서 검색)
        if keyword:
            search_pattern = f"%{keyword}%"
            query = query.filter(
                db.or_(
                    Article.title.ilike(search_pattern),
                    Article.description.ilike(search_pattern)
                )
            )

        # 감성 필터
        if sentiment:
            query = query.filter(Article.sentiment == sentiment)

        # PR 대응 필요 필터
        if needs_response:
            query = query.filter(Article.needs_response == True)

        # 리스크 레벨 필터
        if risk_level:
            query = query.filter(Article.risk_level == risk_level)

        # 상태 필터
        if status:
            query = query.filter(Article.status == status)

        # 담당자 필터
        if assignee_id:
            query = query.filter(Article.assignee_id == assignee_id)

        # 대응 완료 제외 필터
        if exclude_resolved:
            query = query.filter(Article.status != 'resolved')

        # 최신순 정렬 (리스크 레벨 우선)
        query = query.order_by(
            db.case(
                (Article.risk_level == 'red', 1),
                (Article.risk_level == 'amber', 2),
                (Article.risk_level == 'green', 3),
                else_=4
            ),
            Article.published_date.desc()
        )

        # 페이지네이션
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        articles = [article.to_dict() for article in pagination.items]

        return jsonify({
            'articles': articles,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages
        })

    except Exception as e:
        logger.error(f"기사 조회 중 오류: {e}")
        return jsonify({'error': '기사 조회 실패'}), 500

@bp.route('/today', methods=['GET'])
def get_today_articles():
    """오늘의 의료 기사 조회"""
    try:
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)

        articles = Article.query.filter(
            Article.is_medical == True,
            Article.published_date.isnot(None),
            Article.published_date >= today,
            Article.published_date < tomorrow
        ).order_by(Article.published_date.desc()).all()

        return jsonify({
            'articles': [article.to_dict() for article in articles],
            'total': len(articles),
            'date': today.date().isoformat()
        })

    except Exception as e:
        logger.error(f"오늘 기사 조회 중 오류: {e}")
        return jsonify({'error': '기사 조회 실패'}), 500

@bp.route('/categories', methods=['GET'])
def get_categories():
    """사용 가능한 카테고리 목록 조회"""
    try:
        categories = db.session.query(Article.category).filter(
            Article.is_medical == True,
            Article.category.isnot(None)
        ).distinct().all()

        category_list = [cat[0] for cat in categories]

        return jsonify({
            'categories': category_list
        })

    except Exception as e:
        logger.error(f"카테고리 조회 중 오류: {e}")
        return jsonify({'error': '카테고리 조회 실패'}), 500

@bp.route('/stats', methods=['GET'])
def get_stats():
    """통계 정보 조회"""
    try:
        total_articles = Article.query.filter_by(is_medical=True).count()

        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        today_articles = Article.query.filter(
            Article.is_medical == True,
            Article.published_date.isnot(None),
            Article.published_date >= today,
            Article.published_date < tomorrow
        ).count()

        # 카테고리별 통계
        category_stats = db.session.query(
            Article.category,
            db.func.count(Article.id)
        ).filter(
            Article.is_medical == True
        ).group_by(Article.category).all()

        category_counts = {(cat if cat else '미분류'): count for cat, count in category_stats}

        # 감성별 통계
        sentiment_stats = db.session.query(
            Article.sentiment,
            db.func.count(Article.id)
        ).filter(
            Article.is_medical == True
        ).group_by(Article.sentiment).all()

        sentiment_counts = {(sent if sent else '미분류'): count for sent, count in sentiment_stats}

        # PR 대응 필요 기사 수
        needs_response_count = Article.query.filter(
            Article.is_medical == True,
            Article.needs_response == True
        ).count()

        return jsonify({
            'total_articles': total_articles,
            'today_articles': today_articles,
            'category_counts': category_counts,
            'sentiment_counts': sentiment_counts,
            'needs_response_count': needs_response_count
        })

    except Exception as e:
        import traceback
        logger.error(f"통계 조회 중 오류: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': '통계 조회 실패'}), 500

@bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """특정 기사 상세 조회"""
    try:
        article = Article.query.get(article_id)

        if not article:
            return jsonify({'error': '기사를 찾을 수 없습니다'}), 404

        return jsonify(article.to_dict())

    except Exception as e:
        logger.error(f"기사 상세 조회 중 오류: {e}")
        return jsonify({'error': '기사 조회 실패'}), 500


# ========== 리스크 관리 엔드포인트 ==========

@bp.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    """대시보드용 리스크 통계"""
    try:
        # 리스크 레벨별 카운트
        red_count = Article.query.filter(
            Article.is_medical == True,
            Article.risk_level == 'red',
            Article.status != 'resolved'
        ).count()

        amber_count = Article.query.filter(
            Article.is_medical == True,
            Article.risk_level == 'amber',
            Article.status != 'resolved'
        ).count()

        green_count = Article.query.filter(
            Article.is_medical == True,
            Article.risk_level == 'green'
        ).count()

        resolved_count = Article.query.filter(
            Article.is_medical == True,
            Article.status == 'resolved'
        ).count()

        # 상태별 카운트
        pending_count = Article.query.filter(
            Article.is_medical == True,
            Article.status == 'pending'
        ).count()

        reviewing_count = Article.query.filter(
            Article.is_medical == True,
            Article.status == 'reviewing'
        ).count()

        # 최근 7일 추이
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_critical = Article.query.filter(
            Article.is_medical == True,
            Article.risk_level == 'red',
            Article.created_at >= week_ago
        ).count()

        return jsonify({
            'risk_levels': {
                'red': red_count,
                'amber': amber_count,
                'green': green_count
            },
            'status': {
                'pending': pending_count,
                'reviewing': reviewing_count,
                'resolved': resolved_count
            },
            'recent_critical_7d': recent_critical
        })

    except Exception as e:
        logger.error(f"대시보드 통계 조회 중 오류: {e}")
        return jsonify({'error': '통계 조회 실패'}), 500


@bp.route('/critical', methods=['GET'])
def get_critical_articles():
    """심각 리스크 기사만 조회 (red 레벨)"""
    try:
        articles = Article.query.filter(
            Article.is_medical == True,
            Article.risk_level == 'red',
            Article.status != 'resolved'
        ).order_by(Article.published_date.desc()).limit(20).all()

        return jsonify({
            'articles': [article.to_dict() for article in articles],
            'total': len(articles)
        })

    except Exception as e:
        logger.error(f"심각 기사 조회 중 오류: {e}")
        return jsonify({'error': '기사 조회 실패'}), 500


@bp.route('/<int:article_id>/status', methods=['PATCH'])
@token_required
def update_article_status(current_user, article_id):
    """기사 상태 변경"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': '기사를 찾을 수 없습니다'}), 404

        data = request.get_json()
        new_status = data.get('status')

        valid_statuses = ['pending', 'reviewing', 'resolved', 'ignored']
        if new_status not in valid_statuses:
            return jsonify({'error': f'유효하지 않은 상태입니다. 허용: {valid_statuses}'}), 400

        article.status = new_status

        # 대응 완료 시 추가 정보 저장
        if new_status == 'resolved':
            article.resolved_at = datetime.utcnow()
            article.resolved_by_id = current_user.id

        db.session.commit()

        return jsonify({
            'message': '상태가 변경되었습니다',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"상태 변경 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': '상태 변경 실패'}), 500


@bp.route('/<int:article_id>/risk-level', methods=['PATCH'])
@token_required
def update_risk_level(current_user, article_id):
    """기사 리스크 레벨 변경"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': '기사를 찾을 수 없습니다'}), 404

        data = request.get_json()
        new_level = data.get('risk_level')

        valid_levels = ['red', 'amber', 'green']
        if new_level not in valid_levels:
            return jsonify({'error': f'유효하지 않은 리스크 레벨입니다. 허용: {valid_levels}'}), 400

        article.risk_level = new_level
        db.session.commit()

        return jsonify({
            'message': '리스크 레벨이 변경되었습니다',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"리스크 레벨 변경 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': '리스크 레벨 변경 실패'}), 500


@bp.route('/<int:article_id>/assignee', methods=['PATCH'])
@token_required
def update_assignee(current_user, article_id):
    """기사 담당자 지정"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': '기사를 찾을 수 없습니다'}), 404

        data = request.get_json()
        assignee_id = data.get('assignee_id')

        if assignee_id:
            assignee = User.query.get(assignee_id)
            if not assignee:
                return jsonify({'error': '담당자를 찾을 수 없습니다'}), 404
            article.assignee_id = assignee_id
        else:
            article.assignee_id = None

        # 담당자 지정 시 자동으로 reviewing 상태로 변경
        if assignee_id and article.status == 'pending':
            article.status = 'reviewing'

        db.session.commit()

        return jsonify({
            'message': '담당자가 지정되었습니다',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"담당자 지정 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': '담당자 지정 실패'}), 500


@bp.route('/<int:article_id>/action-items', methods=['PATCH'])
@token_required
def update_action_items(current_user, article_id):
    """액션 아이템 체크 상태 업데이트"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': '기사를 찾을 수 없습니다'}), 404

        data = request.get_json()
        action_items = data.get('action_items')

        if action_items is not None:
            article.action_items = action_items
            db.session.commit()

        return jsonify({
            'message': '액션 아이템이 업데이트되었습니다',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"액션 아이템 업데이트 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': '액션 아이템 업데이트 실패'}), 500


@bp.route('/workflow-stats', methods=['GET'])
def get_workflow_stats():
    """팀 워크플로우 통계 (담당자별)"""
    try:
        # 담당자별 진행 중 기사 수
        workflow_stats = db.session.query(
            User.id,
            User.name,
            User.picture,
            db.func.count(Article.id).label('assigned_count')
        ).join(
            Article, Article.assignee_id == User.id
        ).filter(
            Article.status.in_(['pending', 'reviewing'])
        ).group_by(User.id).all()

        result = []
        for user_id, name, picture, count in workflow_stats:
            result.append({
                'user_id': user_id,
                'name': name,
                'picture': picture,
                'assigned_count': count
            })

        # 미할당 기사 수
        unassigned_count = Article.query.filter(
            Article.is_medical == True,
            Article.assignee_id.is_(None),
            Article.status.in_(['pending', 'reviewing'])
        ).count()

        return jsonify({
            'by_assignee': result,
            'unassigned_count': unassigned_count
        })

    except Exception as e:
        logger.error(f"워크플로우 통계 조회 중 오류: {e}")
        return jsonify({'error': '통계 조회 실패'}), 500


# ========== AI 분석 엔드포인트 ==========

@bp.route('/<int:article_id>/ai-analyze', methods=['POST'])
@token_required
def analyze_article_ai(current_user, article_id):
    """AI 분석 실행"""
    try:
        from app.services.ai_service import full_ai_analysis

        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': '기사를 찾을 수 없습니다'}), 404

        # AI 분석 수행
        analysis_result = full_ai_analysis(article)

        # 결과 저장
        article.ai_summary = analysis_result['ai_summary']
        article.risk_level = analysis_result['risk_level']
        article.risk_score = analysis_result['risk_score']
        article.ai_risk_analysis = analysis_result['ai_risk_analysis']
        article.action_items = analysis_result['action_items']
        article.similar_cases = analysis_result['similar_cases']

        db.session.commit()

        return jsonify({
            'message': 'AI 분석이 완료되었습니다',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"AI 분석 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': 'AI 분석 실패'}), 500


@bp.route('/batch-analyze', methods=['POST'])
@token_required
def batch_analyze_articles(current_user):
    """여러 기사 일괄 AI 분석"""
    try:
        from app.services.ai_service import full_ai_analysis

        data = request.get_json()
        article_ids = data.get('article_ids', [])

        if not article_ids:
            # 분석되지 않은 기사들 자동 선택
            articles = Article.query.filter(
                Article.is_medical == True,
                Article.ai_summary.is_(None)
            ).limit(10).all()
        else:
            articles = Article.query.filter(Article.id.in_(article_ids)).all()

        results = []
        for article in articles:
            try:
                analysis_result = full_ai_analysis(article)
                article.ai_summary = analysis_result['ai_summary']
                article.risk_level = analysis_result['risk_level']
                article.risk_score = analysis_result['risk_score']
                article.ai_risk_analysis = analysis_result['ai_risk_analysis']
                article.action_items = analysis_result['action_items']
                article.similar_cases = analysis_result['similar_cases']
                results.append({'id': article.id, 'status': 'success'})
            except Exception as e:
                logger.error(f"Article {article.id} analysis error: {e}")
                results.append({'id': article.id, 'status': 'failed', 'error': str(e)})

        db.session.commit()

        return jsonify({
            'message': f'{len([r for r in results if r["status"] == "success"])}개 기사 분석 완료',
            'results': results
        })

    except Exception as e:
        logger.error(f"일괄 AI 분석 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': '일괄 분석 실패'}), 500
