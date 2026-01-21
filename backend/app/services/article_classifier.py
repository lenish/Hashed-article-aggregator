from typing import Dict, List, Tuple
import re
import logging

logger = logging.getLogger(__name__)

class ArticleClassifier:
    """하이브리드 방식의 기사 분류기 (키워드 + 간단한 점수 시스템)"""

    def __init__(self, search_keywords: List[str]):
        self.search_keywords = search_keywords

        # 카테고리별 키워드 (해시드/블록체인/암호화폐 관련)
        self.category_keywords = {
            '투자': ['투자', '펀딩', '시리즈', '시드', '투자유치', 'VC', '벤처캐피털', '벤처투자', '포트폴리오'],
            '블록체인': ['블록체인', '웹3', 'web3', 'defi', '디파이', 'nft', '스마트컨트랙트', '레이어2', '레이어1'],
            '암호화폐': ['비트코인', '이더리움', '암호화폐', '가상자산', '코인', '토큰', '거래소', '업비트', '빗썸'],
            '인물': ['김서준', '대표', 'CEO', '설립자', '파트너', '공동창업자'],
            '정책': ['가상자산법', '규제', '금융위', '금융감독원', '특금법', '정책', '정부'],
            '기타': []
        }

    def classify_article(self, title: str, description: str = "") -> Tuple[bool, str, float, List[str]]:
        """
        기사를 분류하여 관련 여부 판단

        Args:
            title: 기사 제목
            description: 기사 요약

        Returns:
            (is_relevant, category, confidence_score, keywords)
            - is_relevant: 관련 기사 여부
            - category: 카테고리
            - confidence_score: 신뢰도 (0.0 ~ 1.0)
            - keywords: 추출된 키워드 리스트
        """
        text = f"{title} {description}".lower()
        found_keywords = []
        score = 0.0

        # 1단계: 키워드 매칭
        for keyword in self.search_keywords:
            if keyword.lower() in text:
                found_keywords.append(keyword)
                # 제목에 있으면 가중치 2배
                if keyword.lower() in title.lower():
                    score += 2.0
                else:
                    score += 1.0

        # 2단계: 점수 정규화 (0.0 ~ 1.0)
        max_possible_score = len(self.search_keywords) * 2.0
        confidence_score = min(score / max_possible_score, 1.0) if max_possible_score > 0 else 0.0

        # 신뢰도 보정: 키워드가 많을수록 신뢰도 증가 (필터링 전에 적용)
        if len(found_keywords) >= 1:
            confidence_score = max(confidence_score, min(0.5 + (len(found_keywords) * 0.1), 1.0))

        # 3단계: 관련 기사 판단 (신뢰도 0.04 이상)
        is_relevant = confidence_score >= 0.04 and len(found_keywords) >= 1

        # 4단계: 카테고리 분류
        category = self._classify_category(text) if is_relevant else None

        logger.debug(f"분류 결과 - 관련: {is_relevant}, 카테고리: {category}, 신뢰도: {confidence_score:.2f}, 키워드: {found_keywords}")

        return is_relevant, category, confidence_score, found_keywords

    def _classify_category(self, text: str) -> str:
        """텍스트를 기반으로 카테고리 분류"""
        category_scores = {}

        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            category_scores[category] = score

        # 가장 높은 점수의 카테고리 반환
        max_category = max(category_scores.items(), key=lambda x: x[1])

        if max_category[1] > 0:
            return max_category[0]
        else:
            return '기타'

    def batch_classify(self, articles: List[Dict]) -> List[Dict]:
        """
        여러 기사를 일괄 분류

        Args:
            articles: 기사 딕셔너리 리스트

        Returns:
            분류 정보가 추가된 기사 리스트
        """
        classified_articles = []

        for article in articles:
            title = article.get('title', '')
            description = article.get('description', '')

            is_medical, category, confidence, keywords = self.classify_article(title, description)

            article['is_medical'] = is_medical
            article['category'] = category
            article['confidence_score'] = confidence
            article['keywords'] = keywords

            if is_medical:
                classified_articles.append(article)

        logger.info(f"분류 완료: 전체 {len(articles)}개 중 관련 기사 {len(classified_articles)}개")
        return classified_articles
