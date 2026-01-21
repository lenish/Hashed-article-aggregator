from flask import Blueprint, jsonify, request
from app.models.article import Article
from app import db
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('articles', __name__, url_prefix='/api/articles')

@bp.route('/', methods=['GET'])
def get_articles():
    """의료 기사 목록 조회"""
    try:
        # 쿼리 파라미터
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category', None)
        source = request.args.get('source', None)
        date_from = request.args.get('date_from', None)
        date_to = request.args.get('date_to', None)
        keyword = request.args.get('keyword', None)

        # 기본 쿼리: 의료 기사만
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

        # 최신순 정렬
        query = query.order_by(Article.published_date.desc())

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

        return jsonify({
            'total_articles': total_articles,
            'today_articles': today_articles,
            'category_counts': category_counts
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
