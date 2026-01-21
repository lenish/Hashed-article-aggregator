from flask import Blueprint, request, jsonify
from app.routes.auth import token_required
from app.services.notification_service import notification_service
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


@bp.route('/slack/test', methods=['POST'])
@token_required
def test_slack(current_user):
    """Slack 테스트 알림 전송"""
    try:
        message = "🧪 Hashed Risk Manager 테스트 알림입니다."
        result = notification_service.send_slack_message(message)

        if result:
            return jsonify({'message': 'Slack 테스트 알림이 전송되었습니다.'})
        else:
            return jsonify({'error': 'Slack 알림 전송에 실패했습니다. Webhook URL을 확인하세요.'}), 500

    except Exception as e:
        logger.error(f"Slack 테스트 오류: {e}")
        return jsonify({'error': 'Slack 테스트 실패'}), 500


@bp.route('/telegram/test', methods=['POST'])
@token_required
def test_telegram(current_user):
    """Telegram 테스트 알림 전송"""
    try:
        message = "🧪 Hashed Risk Manager 테스트 알림입니다."
        result = notification_service.send_telegram_message(message)

        if result:
            return jsonify({'message': 'Telegram 테스트 알림이 전송되었습니다.'})
        else:
            return jsonify({'error': 'Telegram 알림 전송에 실패했습니다. Bot Token과 Chat ID를 확인하세요.'}), 500

    except Exception as e:
        logger.error(f"Telegram 테스트 오류: {e}")
        return jsonify({'error': 'Telegram 테스트 실패'}), 500


@bp.route('/critical/<int:article_id>', methods=['POST'])
@token_required
def send_critical_alert(current_user, article_id):
    """특정 기사에 대한 심각 리스크 알림 수동 전송"""
    try:
        from app.models.article import Article

        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': '기사를 찾을 수 없습니다'}), 404

        result = notification_service.notify_critical_article(article)

        if result['slack'] or result['telegram']:
            return jsonify({
                'message': '알림이 전송되었습니다.',
                'results': result
            })
        else:
            return jsonify({
                'error': '알림 전송에 실패했습니다.',
                'results': result
            }), 500

    except Exception as e:
        logger.error(f"Critical 알림 오류: {e}")
        return jsonify({'error': '알림 전송 실패'}), 500


@bp.route('/daily-summary', methods=['POST'])
@token_required
def send_daily_summary(current_user):
    """일일 요약 알림 수동 전송"""
    try:
        from app.models.article import Article
        from app import db

        # 통계 계산
        red_count = Article.query.filter(
            Article.is_medical == True,
            Article.risk_level == 'red'
        ).count()

        amber_count = Article.query.filter(
            Article.is_medical == True,
            Article.risk_level == 'amber'
        ).count()

        green_count = Article.query.filter(
            Article.is_medical == True,
            Article.risk_level == 'green'
        ).count()

        stats = {
            'risk_levels': {
                'red': red_count,
                'amber': amber_count,
                'green': green_count
            }
        }

        result = notification_service.send_daily_summary(stats)

        if result['slack'] or result['telegram']:
            return jsonify({
                'message': '일일 요약이 전송되었습니다.',
                'results': result
            })
        else:
            return jsonify({
                'error': '요약 전송에 실패했습니다.',
                'results': result
            }), 500

    except Exception as e:
        logger.error(f"일일 요약 오류: {e}")
        return jsonify({'error': '요약 전송 실패'}), 500
