"""
Notification Service for Slack and Telegram
"""
import requests
import logging
from flask import current_app

logger = logging.getLogger(__name__)


class NotificationService:
    """알림 서비스 (Slack, Telegram)"""

    def __init__(self):
        self._slack_webhook_url = None
        self._telegram_bot_token = None
        self._telegram_chat_id = None

    @property
    def slack_webhook_url(self):
        if self._slack_webhook_url is None:
            self._slack_webhook_url = current_app.config.get('SLACK_WEBHOOK_URL')
        return self._slack_webhook_url

    @property
    def telegram_bot_token(self):
        if self._telegram_bot_token is None:
            self._telegram_bot_token = current_app.config.get('TELEGRAM_BOT_TOKEN')
        return self._telegram_bot_token

    @property
    def telegram_chat_id(self):
        if self._telegram_chat_id is None:
            self._telegram_chat_id = current_app.config.get('TELEGRAM_CHAT_ID')
        return self._telegram_chat_id

    def send_slack_message(self, message: str, blocks: list = None) -> bool:
        """
        Slack으로 메시지 전송

        Args:
            message: 기본 텍스트 메시지
            blocks: Slack Block Kit 형식의 블록 (optional)

        Returns:
            성공 여부
        """
        if not self.slack_webhook_url:
            logger.warning("SLACK_WEBHOOK_URL not configured")
            return False

        try:
            payload = {'text': message}
            if blocks:
                payload['blocks'] = blocks

            response = requests.post(
                self.slack_webhook_url,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            logger.info("Slack message sent successfully")
            return True
        except requests.RequestException as e:
            logger.error(f"Slack message error: {e}")
            return False

    def send_telegram_message(self, message: str, parse_mode: str = 'HTML') -> bool:
        """
        Telegram으로 메시지 전송

        Args:
            message: 메시지 내용
            parse_mode: 파싱 모드 (HTML, Markdown)

        Returns:
            성공 여부
        """
        if not self.telegram_bot_token or not self.telegram_chat_id:
            logger.warning("Telegram credentials not configured")
            return False

        try:
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
            payload = {
                'chat_id': self.telegram_chat_id,
                'text': message,
                'parse_mode': parse_mode
            }
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            logger.info("Telegram message sent successfully")
            return True
        except requests.RequestException as e:
            logger.error(f"Telegram message error: {e}")
            return False

    def notify_critical_article(self, article) -> dict:
        """
        심각 리스크 기사 알림 전송

        Args:
            article: Article 모델 인스턴스

        Returns:
            {'slack': bool, 'telegram': bool}
        """
        # Slack 메시지 (Block Kit 사용)
        slack_blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🚨 심각 리스크 기사 발견",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*리스크 레벨:*\n{article.risk_level.upper()}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*카테고리:*\n{article.category or '미분류'}"
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*제목:*\n{article.title}"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*요약:*\n{article.description[:200] if article.description else 'N/A'}..."
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "원문 보기"
                        },
                        "url": article.url
                    }
                ]
            }
        ]

        slack_message = f"🚨 심각 리스크 기사: {article.title}"
        slack_result = self.send_slack_message(slack_message, slack_blocks)

        # Telegram 메시지
        telegram_message = f"""
🚨 <b>심각 리스크 기사 발견</b>

<b>리스크 레벨:</b> {article.risk_level.upper()}
<b>카테고리:</b> {article.category or '미분류'}

<b>제목:</b>
{article.title}

<b>요약:</b>
{article.description[:200] if article.description else 'N/A'}...

<a href="{article.url}">원문 보기</a>
"""
        telegram_result = self.send_telegram_message(telegram_message)

        return {
            'slack': slack_result,
            'telegram': telegram_result
        }

    def send_daily_summary(self, stats: dict) -> dict:
        """
        일일 요약 알림 전송

        Args:
            stats: 통계 정보 딕셔너리

        Returns:
            {'slack': bool, 'telegram': bool}
        """
        risk_levels = stats.get('risk_levels', {})
        red = risk_levels.get('red', 0)
        amber = risk_levels.get('amber', 0)
        green = risk_levels.get('green', 0)

        # Slack 메시지
        slack_message = f"""
📊 *일일 리스크 모니터링 요약*

• 🔴 심각 (Red): {red}건
• 🟡 주의 (Amber): {amber}건
• 🟢 정상 (Green): {green}건

총 {red + amber + green}건의 기사가 모니터링되었습니다.
"""
        slack_result = self.send_slack_message(slack_message)

        # Telegram 메시지
        telegram_message = f"""
📊 <b>일일 리스크 모니터링 요약</b>

• 🔴 심각 (Red): {red}건
• 🟡 주의 (Amber): {amber}건
• 🟢 정상 (Green): {green}건

총 {red + amber + green}건의 기사가 모니터링되었습니다.
"""
        telegram_result = self.send_telegram_message(telegram_message)

        return {
            'slack': slack_result,
            'telegram': telegram_result
        }


# 싱글톤 인스턴스
notification_service = NotificationService()


def send_slack_notification(message: str, blocks: list = None) -> bool:
    """Slack 알림 전송 (편의 함수)"""
    return notification_service.send_slack_message(message, blocks)


def send_telegram_notification(message: str) -> bool:
    """Telegram 알림 전송 (편의 함수)"""
    return notification_service.send_telegram_message(message)


def notify_critical(article) -> dict:
    """심각 리스크 알림 전송 (편의 함수)"""
    return notification_service.notify_critical_article(article)
