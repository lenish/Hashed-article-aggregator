from typing import Dict, List, Tuple
import re
import logging

logger = logging.getLogger(__name__)

class ArticleClassifier:
    """하이브리드 방식의 기사 분류기 (키워드 + 간단한 점수 시스템)"""

    def __init__(self, search_keywords: List[str]):
        self.search_keywords = search_keywords

        # 해시드 회사 관련 핵심 키워드 (높은 가중치)
        self.hashed_company_keywords = [
            '해시드', '해시드 벤처스', 'hashed ventures', 'hashed fund',
            '김서준', '김서준 대표', '해시드 대표', '해시드 파트너',
            '해시드 투자', '해시드 포트폴리오', '해시드 펀드'
        ]

        # 동사/기술적 용어 hashed 제외 패턴 (필터링 대상)
        self.exclude_patterns = [
            'hashed password', 'hashed data', 'hashed value', 'hashed string',
            'password hashed', 'data hashed', 'hash function', 'hash algorithm',
            'hash table', 'hash map', 'cryptographic hash', 'sha-256', 'sha256',
            'md5 hash', 'bcrypt', 'password hash', 'hashing algorithm',
            'hashed using', 'hashed with', 'hashed into', 'get hashed',
            'being hashed', 'was hashed', 'were hashed', 'is hashed'
        ]

        # 카테고리별 키워드 (해시드/블록체인/암호화폐 관련)
        self.category_keywords = {
            '투자': ['투자', '펀딩', '시리즈', '시드', '투자유치', 'VC', '벤처캐피털', '벤처투자', '포트폴리오'],
            '블록체인': ['블록체인', '웹3', 'web3', 'defi', '디파이', 'nft', '스마트컨트랙트', '레이어2', '레이어1'],
            '암호화폐': ['비트코인', '이더리움', '암호화폐', '가상자산', '코인', '토큰', '거래소', '업비트', '빗썸'],
            '인물': ['김서준', '대표', 'CEO', '설립자', '파트너', '공동창업자'],
            '정책': ['가상자산법', '규제', '금융위', '금융감독원', '특금법', '정책', '정부'],
            '기타': []
        }

        # 감성 분석 키워드
        self.negative_keywords = [
            '소송', '고소', '피해', '사기', '논란', '문제', '비판', '실패', '손실',
            '하락', '폭락', '철수', '경고', '위기', '의혹', '수사', '기소', '횡령',
            '배임', '파산', '부도', '불법', '탈세', '처벌', '제재', '압수수색'
        ]
        self.positive_keywords = [
            '성공', '성장', '상승', '급등', '호재', '협력', '파트너십', '계약',
            '확장', '진출', '수상', '선정', '인정', '혁신', '돌파', '달성',
            '흑자', '이익', '수익', '투자유치', '시리즈'
        ]

        # PR 대응 필요 키워드
        self.response_keywords = [
            '해명', '입장', '반박', '대응', '공식', '발표', '설명', '소송', '고소',
            '피해', '논란', '의혹', '비판', '항의', '시위', '고발', '신고'
        ]

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

        # 0단계: 기술적 용어 "hashed" 제외 (동사로 사용된 경우)
        is_tech_hashed = self._is_technical_hashed(text)
        if is_tech_hashed:
            logger.debug(f"기술적 용어 hashed로 판단되어 제외: {title[:50]}...")
            return False, None, 0.0, []

        # 1단계: 해시드 회사 관련 핵심 키워드 체크 (높은 가중치)
        for keyword in self.hashed_company_keywords:
            if keyword.lower() in text:
                found_keywords.append(keyword)
                # 제목에 있으면 가중치 3배 (회사 관련 키워드는 더 높은 점수)
                if keyword.lower() in title.lower():
                    score += 3.0
                else:
                    score += 1.5

        # 2단계: 일반 키워드 매칭
        for keyword in self.search_keywords:
            if keyword.lower() in text and keyword not in found_keywords:
                found_keywords.append(keyword)
                # 제목에 있으면 가중치 2배
                if keyword.lower() in title.lower():
                    score += 2.0
                else:
                    score += 1.0

        # 3단계: 점수 정규화 (0.0 ~ 1.0)
        max_possible_score = (len(self.hashed_company_keywords) * 3.0) + (len(self.search_keywords) * 2.0)
        confidence_score = min(score / max_possible_score, 1.0) if max_possible_score > 0 else 0.0

        # 신뢰도 보정: 해시드 회사 키워드가 있으면 높은 신뢰도
        hashed_company_found = any(kw.lower() in text for kw in self.hashed_company_keywords)
        if hashed_company_found:
            confidence_score = max(confidence_score, 0.7)
        elif len(found_keywords) >= 1:
            confidence_score = max(confidence_score, min(0.5 + (len(found_keywords) * 0.1), 1.0))

        # 4단계: 관련 기사 판단 (신뢰도 0.04 이상)
        is_relevant = confidence_score >= 0.04 and len(found_keywords) >= 1

        # 5단계: 카테고리 분류
        category = self._classify_category(text) if is_relevant else None

        logger.debug(f"분류 결과 - 관련: {is_relevant}, 카테고리: {category}, 신뢰도: {confidence_score:.2f}, 키워드: {found_keywords}")

        return is_relevant, category, confidence_score, found_keywords

    def _is_technical_hashed(self, text: str) -> bool:
        """
        텍스트가 기술적 용어로서의 'hashed'를 포함하는지 확인
        (동사로 사용된 경우 True 반환)

        Args:
            text: 검사할 텍스트 (소문자)

        Returns:
            True if 기술적 용어로 판단됨
        """
        text_lower = text.lower()

        # 제외 패턴 체크
        for pattern in self.exclude_patterns:
            if pattern in text_lower:
                return True

        # 'hashed' 또는 'Hashed'가 있는 경우 추가 확인
        if 'hashed' in text_lower:
            # 해시드 회사 관련 키워드가 있으면 기술적 용어 아님
            for company_keyword in self.hashed_company_keywords:
                if company_keyword.lower() in text_lower:
                    return False

            # 블록체인/투자 관련 컨텍스트가 있으면 회사로 판단
            investment_context = ['투자', '벤처', 'vc', '펀딩', '포트폴리오', '암호화폐', '가상자산', '블록체인', 'web3']
            for context in investment_context:
                if context in text_lower:
                    return False

            # 위 조건에 해당하지 않고 'hashed'만 있는 경우 기술적 용어로 판단
            # (단, 한글 '해시드'가 없는 경우에만)
            if '해시드' not in text_lower:
                return True

        return False

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

    def analyze_sentiment(self, title: str, description: str = "") -> str:
        """
        기사의 감성을 분석하여 긍정/부정/중립 판단

        Args:
            title: 기사 제목
            description: 기사 요약

        Returns:
            sentiment: 'positive', 'negative', 'neutral'
        """
        text = f"{title} {description}".lower()

        # 부정 키워드 카운트 (제목에 있으면 가중치 2배)
        negative_score = 0
        for keyword in self.negative_keywords:
            if keyword in title.lower():
                negative_score += 2
            elif keyword in text:
                negative_score += 1

        # 긍정 키워드 카운트 (제목에 있으면 가중치 2배)
        positive_score = 0
        for keyword in self.positive_keywords:
            if keyword in title.lower():
                positive_score += 2
            elif keyword in text:
                positive_score += 1

        # 감성 판정
        if negative_score > positive_score and negative_score >= 1:
            return 'negative'
        elif positive_score > negative_score and positive_score >= 1:
            return 'positive'
        else:
            return 'neutral'

    def check_needs_response(self, title: str, description: str = "") -> bool:
        """
        PR 대응 필요 여부 판단

        Args:
            title: 기사 제목
            description: 기사 요약

        Returns:
            needs_response: True/False
        """
        text = f"{title} {description}".lower()

        # 대응 필요 키워드가 있으면 True
        for keyword in self.response_keywords:
            if keyword in text:
                logger.debug(f"PR 대응 필요 키워드 발견: {keyword}")
                return True

        return False

    def calculate_risk(self, title: str, description: str = "", sentiment: str = None) -> Tuple[str, int]:
        """
        리스크 레벨 및 점수 계산

        Args:
            title: 기사 제목
            description: 기사 요약
            sentiment: 사전 분석된 감성 (optional)

        Returns:
            (risk_level, risk_score)
            - risk_level: 'red', 'amber', 'green'
            - risk_score: 0-100
        """
        text = f"{title} {description}".lower()

        # 감성 분석 (사전 분석 결과가 없으면 새로 계산)
        if sentiment is None:
            sentiment = self.analyze_sentiment(title, description)

        # 고위험 키워드 (제목에 있으면 가중치 3배)
        high_risk_keywords = [
            '소송', '고소', '사기', '피해', '검찰', '수사', '횡령', '배임',
            '경찰', '구속', '체포', '기소', '압수수색', '불법', '범죄'
        ]

        # 중위험 키워드
        medium_risk_keywords = [
            '논란', '의혹', '비판', '우려', '하락', '손실', '규제', '제재',
            '경고', '위기', '실패', '철수', '폭락', '위반'
        ]

        risk_score = 0

        # 고위험 키워드 점수 계산
        for keyword in high_risk_keywords:
            if keyword in title.lower():
                risk_score += 25  # 제목에 있으면 25점
            elif keyword in text:
                risk_score += 10  # 본문에 있으면 10점

        # 중위험 키워드 점수 계산
        for keyword in medium_risk_keywords:
            if keyword in title.lower():
                risk_score += 15  # 제목에 있으면 15점
            elif keyword in text:
                risk_score += 5   # 본문에 있으면 5점

        # 감성에 따른 보정
        if sentiment == 'negative':
            risk_score += 15
        elif sentiment == 'positive':
            risk_score = max(0, risk_score - 10)

        # PR 대응 필요 시 추가 점수
        if self.check_needs_response(title, description):
            risk_score += 10

        # 점수 제한 (0-100)
        risk_score = min(100, max(0, risk_score))

        # 레벨 결정
        if risk_score >= 70:
            risk_level = 'red'
        elif risk_score >= 40:
            risk_level = 'amber'
        else:
            risk_level = 'green'

        logger.debug(f"리스크 계산 - 레벨: {risk_level}, 점수: {risk_score}")
        return risk_level, risk_score

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

            # 감성 분석 및 PR 대응 필요 여부
            sentiment = self.analyze_sentiment(title, description)
            article['sentiment'] = sentiment
            article['needs_response'] = self.check_needs_response(title, description)

            # 리스크 레벨 및 점수 계산
            risk_level, risk_score = self.calculate_risk(title, description, sentiment)
            article['risk_level'] = risk_level
            article['risk_score'] = risk_score

            if is_medical:
                classified_articles.append(article)

        logger.info(f"분류 완료: 전체 {len(articles)}개 중 관련 기사 {len(classified_articles)}개")
        return classified_articles
