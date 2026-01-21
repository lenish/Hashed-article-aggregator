"""
AI Service using Anthropic Claude API for article analysis
"""
import json
import logging
from flask import current_app

logger = logging.getLogger(__name__)

# Anthropic 클라이언트 초기화는 사용 시 수행
_anthropic_client = None


def get_anthropic_client():
    """Anthropic 클라이언트 가져오기 (lazy initialization)"""
    global _anthropic_client
    if _anthropic_client is None:
        try:
            import anthropic
            api_key = current_app.config.get('ANTHROPIC_API_KEY')
            if not api_key:
                logger.warning("ANTHROPIC_API_KEY not configured")
                return None
            _anthropic_client = anthropic.Anthropic(api_key=api_key)
        except ImportError:
            logger.error("anthropic package not installed. Run: pip install anthropic")
            return None
    return _anthropic_client


def generate_summary(title: str, description: str, content: str = None) -> str:
    """
    기사 3줄 요약 생성
    """
    client = get_anthropic_client()
    if not client:
        return _fallback_summary(title, description)

    try:
        prompt = f"""다음 뉴스 기사를 핵심 내용 3줄로 요약해주세요.
한국어로 작성하고, 각 줄은 명확하고 간결하게 작성해주세요.

제목: {title}
내용: {description or content or ''}

요약 (3줄):"""

        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text.strip()
    except Exception as e:
        logger.error(f"Summary generation error: {e}")
        return _fallback_summary(title, description)


def _fallback_summary(title: str, description: str) -> str:
    """AI 사용 불가 시 폴백 요약"""
    summary = f"• {title[:100]}..."
    if description:
        summary += f"\n• {description[:150]}..."
    summary += "\n• 상세 분석을 위해 원문을 확인하세요."
    return summary


def analyze_risk(title: str, description: str, category: str = None) -> dict:
    """
    리스크 분석 수행
    Returns: {'level': 'red/amber/green', 'score': 0-100, 'analysis': str}
    """
    client = get_anthropic_client()
    if not client:
        return _fallback_risk_analysis(title, description)

    try:
        prompt = f"""다음 뉴스 기사의 리스크를 분석해주세요.
'해시드(Hashed)'는 한국의 블록체인/암호화폐 벤처캐피털입니다.

기사 제목: {title}
기사 내용: {description or ''}
카테고리: {category or '미분류'}

다음 형식으로 JSON 응답해주세요:
{{
    "level": "red/amber/green 중 하나",
    "score": 0-100 사이 숫자,
    "analysis": "리스크 분석 내용 (한국어, 2-3문장)"
}}

리스크 기준:
- RED (70-100점): 해시드에 직접적인 부정적 영향, 법적 문제, 심각한 평판 리스크
- AMBER (40-69점): 간접적 영향 가능, 모니터링 필요, 업계 전반의 부정적 뉴스
- GREEN (0-39점): 긍정적이거나 중립적 뉴스, 리스크 없음

JSON만 응답해주세요:"""

        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text.strip()
        # JSON 파싱 시도
        try:
            # JSON 블록 추출
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]

            result = json.loads(response_text)
            return {
                'level': result.get('level', 'green'),
                'score': int(result.get('score', 0)),
                'analysis': result.get('analysis', '')
            }
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse AI response: {response_text}")
            return _fallback_risk_analysis(title, description)

    except Exception as e:
        logger.error(f"Risk analysis error: {e}")
        return _fallback_risk_analysis(title, description)


def _fallback_risk_analysis(title: str, description: str) -> dict:
    """AI 사용 불가 시 키워드 기반 폴백 분석"""
    text = f"{title} {description}".lower()

    # 고위험 키워드
    red_keywords = ['소송', '고소', '사기', '피해', '검찰', '수사', '횡령', '배임', '경찰', '구속']
    # 중위험 키워드
    amber_keywords = ['논란', '의혹', '비판', '우려', '하락', '손실', '규제', '제재', '경고']

    red_count = sum(1 for kw in red_keywords if kw in text)
    amber_count = sum(1 for kw in amber_keywords if kw in text)

    if red_count >= 2:
        return {'level': 'red', 'score': 80, 'analysis': '고위험 키워드가 다수 감지되었습니다. 즉시 확인이 필요합니다.'}
    elif red_count >= 1 or amber_count >= 2:
        return {'level': 'amber', 'score': 55, 'analysis': '주의가 필요한 내용이 포함되어 있습니다. 모니터링을 권장합니다.'}
    else:
        return {'level': 'green', 'score': 20, 'analysis': '특별한 리스크가 감지되지 않았습니다.'}


def generate_action_items(title: str, description: str, risk_level: str) -> list:
    """
    실행 액션 아이템 생성
    Returns: [{'text': str, 'checked': bool}, ...]
    """
    client = get_anthropic_client()
    if not client:
        return _fallback_action_items(risk_level)

    try:
        prompt = f"""다음 뉴스 기사에 대한 대응 액션 아이템을 생성해주세요.
'해시드(Hashed)'의 PR/위기관리 팀 관점에서 작성해주세요.

기사 제목: {title}
기사 내용: {description or ''}
리스크 레벨: {risk_level.upper()}

다음 형식으로 JSON 배열로 응답해주세요 (3-5개 항목):
[
    {{"text": "액션 아이템 1", "checked": false}},
    {{"text": "액션 아이템 2", "checked": false}}
]

JSON만 응답해주세요:"""

        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text.strip()
        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]

            items = json.loads(response_text)
            return [{'text': item['text'], 'checked': False} for item in items]
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse action items: {response_text}")
            return _fallback_action_items(risk_level)

    except Exception as e:
        logger.error(f"Action items generation error: {e}")
        return _fallback_action_items(risk_level)


def _fallback_action_items(risk_level: str) -> list:
    """AI 사용 불가 시 폴백 액션 아이템"""
    if risk_level == 'red':
        return [
            {'text': '경영진에게 즉시 보고', 'checked': False},
            {'text': '법무팀 검토 요청', 'checked': False},
            {'text': 'PR팀 대응 방안 수립', 'checked': False},
            {'text': '관련 부서 긴급 회의 소집', 'checked': False},
            {'text': '공식 입장문 초안 작성', 'checked': False}
        ]
    elif risk_level == 'amber':
        return [
            {'text': '기사 상세 내용 파악', 'checked': False},
            {'text': '관련 담당자에게 공유', 'checked': False},
            {'text': '추가 기사 모니터링', 'checked': False},
            {'text': '필요시 대응 방안 검토', 'checked': False}
        ]
    else:
        return [
            {'text': '기사 내용 확인 완료', 'checked': False},
            {'text': '필요시 내부 공유', 'checked': False}
        ]


def find_similar_cases(title: str, keywords: list = None) -> list:
    """
    유사 사례 검색 (현재는 목업 데이터)
    실제 구현 시 DB 검색 또는 외부 API 연동
    """
    # TODO: 실제 유사 사례 검색 로직 구현
    return []


def full_ai_analysis(article) -> dict:
    """
    전체 AI 분석 수행
    """
    title = article.title
    description = article.description or ''
    category = article.category

    # 요약 생성
    summary = generate_summary(title, description)

    # 리스크 분석
    risk_result = analyze_risk(title, description, category)

    # 액션 아이템 생성
    action_items = generate_action_items(title, description, risk_result['level'])

    # 유사 사례 검색
    similar_cases = find_similar_cases(title, article.keywords)

    return {
        'ai_summary': summary,
        'risk_level': risk_result['level'],
        'risk_score': risk_result['score'],
        'ai_risk_analysis': risk_result['analysis'],
        'action_items': action_items,
        'similar_cases': similar_cases
    }
