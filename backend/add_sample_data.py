"""샘플 의료 기사 데이터 추가 스크립트"""
from datetime import datetime, timedelta
from app import create_app, db
from app.models.article import Article
import random

app = create_app()

sample_articles = [
    {
        'title': '서울대병원, AI 기반 암 진단 시스템 도입',
        'description': '서울대학교병원이 인공지능 기반의 암 조기 진단 시스템을 도입했다. 이 시스템은 CT 영상을 분석해 폐암을 95% 이상의 정확도로 진단할 수 있다.',
        'url': 'https://example.com/article1',
        'source': '메디컬타임즈',
        'category': '병원',
        'keywords': ['AI', '암', '진단', '서울대병원', '폐암']
    },
    {
        'title': '국내 제약사, 치매 신약 임상 3상 성공',
        'description': '국내 제약사가 개발한 알츠하이머 치매 신약이 임상 3상에서 유의미한 효과를 보였다. 환자의 인지 기능이 평균 30% 개선된 것으로 나타났다.',
        'url': 'https://example.com/article2',
        'source': '청년의사',
        'category': '제약',
        'keywords': ['신약', '치매', '알츠하이머', '임상시험', '제약']
    },
    {
        'title': '건강보험 보장성 강화, 내년부터 MRI 급여 확대',
        'description': '보건복지부가 내년부터 MRI 검사의 건강보험 급여를 대폭 확대한다고 발표했다. 이로 인해 환자 본인부담금이 평균 40만원에서 10만원으로 감소할 전망이다.',
        'url': 'https://example.com/article3',
        'source': '메디게이트',
        'category': '정책',
        'keywords': ['건강보험', '보건복지부', 'MRI', '급여', '정책']
    },
    {
        'title': '독감 환자 급증, 예방접종 권고',
        'description': '질병관리청이 독감 환자가 급증하면서 예방접종을 적극 권장했다. 특히 65세 이상 노인과 만성질환자는 반드시 접종해야 한다고 강조했다.',
        'url': 'https://example.com/article4',
        'source': '뉴스1',
        'category': '질병',
        'keywords': ['독감', '예방접종', '질병관리청', '백신', '감염']
    },
    {
        'title': 'KAIST 연구팀, 혈액 한 방울로 암 진단 기술 개발',
        'description': 'KAIST 연구팀이 혈액 한 방울만으로 10종의 암을 조기 진단할 수 있는 기술을 개발했다. 이 기술은 기존 방법보다 정확도가 20% 향상되었다.',
        'url': 'https://example.com/article5',
        'source': '사이언스타임즈',
        'category': '연구',
        'keywords': ['KAIST', '암', '진단', '연구', '혈액검사']
    },
    {
        'title': '코로나19 신규 변이 국내 유입, 방역 강화',
        'description': '코로나19 신규 변이가 국내에 유입되면서 방역당국이 대응 체계를 강화했다. 해외 입국자에 대한 검역이 강화되고 있다.',
        'url': 'https://example.com/article6',
        'source': '연합뉴스',
        'category': '질병',
        'keywords': ['코로나19', 'COVID', '변이', '방역', '바이러스']
    },
    {
        'title': '당뇨병 환자를 위한 스마트 인슐린 펌프 출시',
        'description': '국내 의료기기 업체가 AI 기반 자동 혈당 조절 기능을 탑재한 스마트 인슐린 펌프를 출시했다. 환자의 혈당을 실시간으로 모니터링하고 자동으로 인슐린을 투여한다.',
        'url': 'https://example.com/article7',
        'source': '메디칼옵저버',
        'category': '기타',
        'keywords': ['당뇨병', '인슐린', '의료기기', 'AI', '혈당']
    },
    {
        'title': '간호사 처우 개선 법안 국회 통과',
        'description': '간호사의 근무 환경 개선과 처우 향상을 위한 법안이 국회를 통과했다. 간호사 1인당 담당 환자 수가 줄어들고 야간 수당이 인상된다.',
        'url': 'https://example.com/article8',
        'source': '한겨레',
        'category': '정책',
        'keywords': ['간호사', '처우개선', '법안', '국회', '의료정책']
    },
    {
        'title': '빅데이터로 심장병 예측, 성공률 90%',
        'description': '서울아산병원 연구팀이 빅데이터와 AI를 활용해 심장병 발생을 90% 정확도로 예측하는 모델을 개발했다. 조기 예방에 큰 도움이 될 것으로 기대된다.',
        'url': 'https://example.com/article9',
        'source': '메디파나뉴스',
        'category': '연구',
        'keywords': ['빅데이터', 'AI', '심장병', '예측', '연구']
    },
    {
        'title': '전국 병원 응급실 포화 상태, 대책 시급',
        'description': '겨울철 독감과 호흡기 질환 환자 증가로 전국 주요 병원 응급실이 포화 상태에 이르렀다. 정부가 긴급 대책을 마련 중이다.',
        'url': 'https://example.com/article10',
        'source': 'KBS뉴스',
        'category': '병원',
        'keywords': ['응급실', '병원', '독감', '호흡기질환', '포화']
    }
]

with app.app_context():
    # 기존 데이터 삭제
    Article.query.delete()

    # 샘플 데이터 추가
    for i, article_data in enumerate(sample_articles):
        # 날짜를 최근부터 오래된 순으로 설정
        published_date = datetime.utcnow() - timedelta(hours=i*3)

        article = Article(
            title=article_data['title'],
            description=article_data['description'],
            url=article_data['url'],
            source=article_data['source'],
            published_date=published_date,
            is_medical=True,
            category=article_data['category'],
            keywords=article_data['keywords'],
            confidence_score=random.uniform(0.75, 0.95)
        )

        db.session.add(article)

    db.session.commit()
    print(f"✅ {len(sample_articles)}개의 샘플 기사가 추가되었습니다!")

    # 통계 출력
    total = Article.query.filter_by(is_medical=True).count()
    categories = db.session.query(Article.category, db.func.count(Article.id)).filter(
        Article.is_medical == True
    ).group_by(Article.category).all()

    print(f"\n📊 통계:")
    print(f"   전체 기사: {total}개")
    print(f"\n📁 카테고리별:")
    for category, count in categories:
        print(f"   - {category}: {count}개")
