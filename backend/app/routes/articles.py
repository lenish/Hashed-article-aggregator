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
    """Get article list with risk management filters"""
    try:
        # Query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category', None)
        source = request.args.get('source', None)
        date_from = request.args.get('date_from', None)
        date_to = request.args.get('date_to', None)
        keyword = request.args.get('keyword', None)
        sentiment = request.args.get('sentiment', None)
        needs_response = request.args.get('needs_response', None)
        # Risk management filters
        risk_level = request.args.get('risk_level', None)
        status = request.args.get('status', None)
        assignee_id = request.args.get('assignee_id', None, type=int)
        exclude_resolved = request.args.get('exclude_resolved', None)

        # Base query: Hashed-related articles only
        query = Article.query.filter_by(is_medical=True)

        # Category filter
        if category:
            query = query.filter_by(category=category)

        # Source filter
        if source:
            query = query.filter(Article.source.ilike(f'%{source}%'))

        # Date filter (start)
        if date_from:
            try:
                date_obj = datetime.fromisoformat(date_from)
                query = query.filter(Article.published_date >= date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid date format (date_from)'}), 400

        # Date filter (end)
        if date_to:
            try:
                date_obj = datetime.fromisoformat(date_to)
                # Include until end of the day
                date_obj = date_obj + timedelta(days=1)
                query = query.filter(Article.published_date < date_obj)
            except ValueError:
                return jsonify({'error': 'Invalid date format (date_to)'}), 400

        # Keyword filter (search in title or description)
        if keyword:
            search_pattern = f"%{keyword}%"
            query = query.filter(
                db.or_(
                    Article.title.ilike(search_pattern),
                    Article.description.ilike(search_pattern)
                )
            )

        # Sentiment filter
        if sentiment:
            query = query.filter(Article.sentiment == sentiment)

        # PR response needed filter
        if needs_response:
            query = query.filter(Article.needs_response == True)

        # Risk level filter
        if risk_level:
            query = query.filter(Article.risk_level == risk_level)

        # Status filter
        if status:
            query = query.filter(Article.status == status)

        # Assignee filter
        if assignee_id:
            query = query.filter(Article.assignee_id == assignee_id)

        # Exclude resolved filter
        if exclude_resolved:
            query = query.filter(Article.status != 'resolved')

        # Sort by latest (risk level priority)
        query = query.order_by(
            db.case(
                (Article.risk_level == 'red', 1),
                (Article.risk_level == 'amber', 2),
                (Article.risk_level == 'green', 3),
                else_=4
            ),
            Article.published_date.desc()
        )

        # Pagination
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
        logger.error(f"Error fetching articles: {e}")
        return jsonify({'error': 'Failed to fetch articles'}), 500

@bp.route('/today', methods=['GET'])
def get_today_articles():
    """Get today's articles"""
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
        logger.error(f"Error fetching today's articles: {e}")
        return jsonify({'error': 'Failed to fetch articles'}), 500

@bp.route('/categories', methods=['GET'])
def get_categories():
    """Get available category list"""
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
        logger.error(f"Error fetching categories: {e}")
        return jsonify({'error': 'Failed to fetch categories'}), 500

@bp.route('/stats', methods=['GET'])
def get_stats():
    """Get statistics"""
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

        # Category statistics
        category_stats = db.session.query(
            Article.category,
            db.func.count(Article.id)
        ).filter(
            Article.is_medical == True
        ).group_by(Article.category).all()

        category_counts = {(cat if cat else 'Uncategorized'): count for cat, count in category_stats}

        # Sentiment statistics
        sentiment_stats = db.session.query(
            Article.sentiment,
            db.func.count(Article.id)
        ).filter(
            Article.is_medical == True
        ).group_by(Article.sentiment).all()

        sentiment_counts = {(sent if sent else 'Uncategorized'): count for sent, count in sentiment_stats}

        # PR response needed count
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
        logger.error(f"Error fetching stats: {e}")
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch stats'}), 500

@bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """Get specific article details"""
    try:
        article = Article.query.get(article_id)

        if not article:
            return jsonify({'error': 'Article not found'}), 404

        return jsonify(article.to_dict())

    except Exception as e:
        logger.error(f"Error fetching article details: {e}")
        return jsonify({'error': 'Failed to fetch article'}), 500


# ========== Risk Management Endpoints ==========

@bp.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    """Dashboard risk statistics"""
    try:
        # Count by risk level
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

        # Count by status
        pending_count = Article.query.filter(
            Article.is_medical == True,
            Article.status == 'pending'
        ).count()

        reviewing_count = Article.query.filter(
            Article.is_medical == True,
            Article.status == 'reviewing'
        ).count()

        # Recent 7 days trend
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
        logger.error(f"Error fetching dashboard stats: {e}")
        return jsonify({'error': 'Failed to fetch stats'}), 500


@bp.route('/critical', methods=['GET'])
def get_critical_articles():
    """Get critical risk articles only (red level)"""
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
        logger.error(f"Error fetching critical articles: {e}")
        return jsonify({'error': 'Failed to fetch articles'}), 500


@bp.route('/<int:article_id>/status', methods=['PATCH'])
@token_required
def update_article_status(current_user, article_id):
    """Update article status"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': 'Article not found'}), 404

        data = request.get_json()
        new_status = data.get('status')

        valid_statuses = ['pending', 'reviewing', 'resolved', 'ignored']
        if new_status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Allowed: {valid_statuses}'}), 400

        article.status = new_status

        # Save additional info when resolved
        if new_status == 'resolved':
            article.resolved_at = datetime.utcnow()
            article.resolved_by_id = current_user.id

        db.session.commit()

        return jsonify({
            'message': 'Status updated',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"Error updating status: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update status'}), 500


@bp.route('/<int:article_id>/risk-level', methods=['PATCH'])
@token_required
def update_risk_level(current_user, article_id):
    """Update article risk level"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': 'Article not found'}), 404

        data = request.get_json()
        new_level = data.get('risk_level')

        valid_levels = ['red', 'amber', 'green']
        if new_level not in valid_levels:
            return jsonify({'error': f'Invalid risk level. Allowed: {valid_levels}'}), 400

        article.risk_level = new_level
        db.session.commit()

        return jsonify({
            'message': 'Risk level updated',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"Error updating risk level: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update risk level'}), 500


@bp.route('/<int:article_id>/assignee', methods=['PATCH'])
@token_required
def update_assignee(current_user, article_id):
    """Assign article to user"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': 'Article not found'}), 404

        data = request.get_json()
        assignee_id = data.get('assignee_id')

        if assignee_id:
            assignee = User.query.get(assignee_id)
            if not assignee:
                return jsonify({'error': 'Assignee not found'}), 404
            article.assignee_id = assignee_id
        else:
            article.assignee_id = None

        # Auto change to reviewing status when assigned
        if assignee_id and article.status == 'pending':
            article.status = 'reviewing'

        db.session.commit()

        return jsonify({
            'message': 'Assignee updated',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"Error updating assignee: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update assignee'}), 500


@bp.route('/<int:article_id>/action-items', methods=['PATCH'])
@token_required
def update_action_items(current_user, article_id):
    """Update action item check status"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': 'Article not found'}), 404

        data = request.get_json()
        action_items = data.get('action_items')

        if action_items is not None:
            article.action_items = action_items
            db.session.commit()

        return jsonify({
            'message': 'Action items updated',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"Error updating action items: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update action items'}), 500


@bp.route('/workflow-stats', methods=['GET'])
def get_workflow_stats():
    """Team workflow statistics (by assignee)"""
    try:
        # Articles in progress by assignee
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

        # Unassigned article count
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
        logger.error(f"Error fetching workflow stats: {e}")
        return jsonify({'error': 'Failed to fetch stats'}), 500


# ========== AI Analysis Endpoints ==========

@bp.route('/<int:article_id>/ai-analyze', methods=['POST'])
@token_required
def analyze_article_ai(current_user, article_id):
    """Run AI analysis"""
    try:
        from app.services.ai_service import full_ai_analysis

        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': 'Article not found'}), 404

        # Perform AI analysis
        analysis_result = full_ai_analysis(article)

        # Save results
        article.ai_summary = analysis_result['ai_summary']
        article.risk_level = analysis_result['risk_level']
        article.risk_score = analysis_result['risk_score']
        article.ai_risk_analysis = analysis_result['ai_risk_analysis']
        article.action_items = analysis_result['action_items']
        article.similar_cases = analysis_result['similar_cases']

        db.session.commit()

        return jsonify({
            'message': 'AI analysis completed',
            'article': article.to_dict()
        })

    except Exception as e:
        logger.error(f"Error during AI analysis: {e}")
        db.session.rollback()
        return jsonify({'error': 'AI analysis failed'}), 500


@bp.route('/batch-analyze', methods=['POST'])
@token_required
def batch_analyze_articles(current_user):
    """Batch AI analysis for multiple articles"""
    try:
        from app.services.ai_service import full_ai_analysis

        data = request.get_json()
        article_ids = data.get('article_ids', [])

        if not article_ids:
            # Auto-select unanalyzed articles
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
            'message': f'{len([r for r in results if r["status"] == "success"])} articles analyzed',
            'results': results
        })

    except Exception as e:
        logger.error(f"Error during batch AI analysis: {e}")
        db.session.rollback()
        return jsonify({'error': 'Batch analysis failed'}), 500
