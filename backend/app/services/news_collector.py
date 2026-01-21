import requests
from datetime import datetime, timedelta
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class NewsCollector:
    """네이버 뉴스 API를 사용한 기사 수집기"""

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://openapi.naver.com/v1/search/news.json"

    def collect_articles(self, query: str = "의료", display: int = 100, start: int = 1) -> List[Dict]:
        """
        네이버 뉴스 API에서 기사 수집

        Args:
            query: 검색 쿼리 (기본값: "의료")
            display: 한 번에 가져올 기사 수 (최대 100)
            start: 검색 시작 위치

        Returns:
            기사 목록
        """
        headers = {
            "X-Naver-Client-Id": self.client_id,
            "X-Naver-Client-Secret": self.client_secret
        }

        params = {
            "query": query,
            "display": display,
            "start": start,
            "sort": "date"  # 최신순 정렬
        }

        try:
            response = requests.get(self.base_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

            articles = []
            for item in data.get('items', []):
                article = {
                    'title': self._clean_html(item.get('title', '')),
                    'description': self._clean_html(item.get('description', '')),
                    'url': item.get('link', ''),
                    'source': '네이버뉴스',
                    'published_date': self._parse_date(item.get('pubDate', ''))
                }
                articles.append(article)

            logger.info(f"수집된 기사: {len(articles)}개")
            return articles

        except requests.RequestException as e:
            logger.error(f"기사 수집 중 오류 발생: {e}")
            return []

    def collect_medical_articles(self, max_articles: int = 100) -> List[Dict]:
        """
        의료 관련 기사 수집 (여러 키워드 사용)

        Args:
            max_articles: 수집할 최대 기사 수

        Returns:
            의료 관련 기사 목록
        """
        medical_queries = ['의료', '병원', '건강', '질병', '치료', '신약']
        all_articles = []
        articles_per_query = max_articles // len(medical_queries)

        for query in medical_queries:
            articles = self.collect_articles(query=query, display=min(articles_per_query, 100))
            all_articles.extend(articles)

            if len(all_articles) >= max_articles:
                break

        # URL 기준으로 중복 제거
        unique_articles = {article['url']: article for article in all_articles}
        return list(unique_articles.values())[:max_articles]

    def _clean_html(self, text: str) -> str:
        """HTML 태그 제거"""
        import re
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text)

    def _parse_date(self, date_str: str) -> datetime:
        """날짜 문자열을 datetime 객체로 변환"""
        try:
            # RFC 822 형식: "Mon, 21 Jan 2025 12:00:00 +0900"
            from email.utils import parsedate_to_datetime
            return parsedate_to_datetime(date_str)
        except Exception as e:
            logger.warning(f"날짜 파싱 실패: {date_str}, 오류: {e}")
            return datetime.utcnow()
