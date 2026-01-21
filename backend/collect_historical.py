"""6개월간의 의료 기사 수집 스크립트"""
from datetime import datetime, timedelta
from app import create_app, db
from app.services.news_collector import NewsCollector
from app.services.article_classifier import ArticleClassifier
from app.models.article import Article
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = create_app()

def collect_historical_articles(months=6):
    """
    지난 N개월간의 의료 기사 수집

    Args:
        months: 수집할 개월 수
    """
    with app.app_context():
        client_id = app.config.get('NAVER_CLIENT_ID')
        client_secret = app.config.get('NAVER_CLIENT_SECRET')
        search_keywords = app.config.get('SEARCH_KEYWORDS')

        if not client_id or not client_secret:
            logger.error("Naver API 설정이 없습니다.")
            return

        collector = NewsCollector(client_id, client_secret)
        classifier = ArticleClassifier(search_keywords)

        # 해시드 관련 검색 키워드
        search_queries = [
            '해시드', 'Hashed', '해시드 벤처스', '주식회사 해시드', '김서준'
        ]

        total_collected = 0
        total_saved = 0
        total_skipped = 0

        # 각 키워드별로 수집
        for query in search_queries:
            logger.info(f"=== '{query}' 키워드로 수집 시작 ===")

            # 네이버 API는 최대 1000개까지 결과 제공 (start=1~1000)
            # 각 요청은 최대 100개까지
            max_start = 1000
            display = 100

            for start in range(1, max_start, display):
                try:
                    logger.info(f"수집 중... start={start}, display={display}")

                    # 기사 수집
                    articles = collector.collect_articles(
                        query=query,
                        display=display,
                        start=start
                    )

                    if not articles:
                        logger.info(f"'{query}' 키워드의 더 이상 기사 없음")
                        break

                    total_collected += len(articles)

                    # 의료 기사 분류
                    medical_articles = classifier.batch_classify(articles)

                    # 데이터베이스 저장
                    saved_count = 0
                    skipped_count = 0

                    for article_data in medical_articles:
                        # URL 중복 체크
                        existing = Article.query.filter_by(url=article_data['url']).first()
                        if existing:
                            skipped_count += 1
                            continue

                        article = Article(
                            title=article_data['title'],
                            description=article_data['description'],
                            url=article_data['url'],
                            source=article_data['source'],
                            published_date=article_data['published_date'],
                            is_medical=article_data['is_medical'],
                            category=article_data['category'],
                            keywords=article_data['keywords'],
                            confidence_score=article_data['confidence_score']
                        )

                        db.session.add(article)
                        saved_count += 1

                    db.session.commit()

                    total_saved += saved_count
                    total_skipped += skipped_count

                    logger.info(f"배치 완료: 수집={len(articles)}, 의료={len(medical_articles)}, 저장={saved_count}, 중복={skipped_count}")

                    # API 호출 제한 고려하여 딜레이
                    time.sleep(0.5)

                except Exception as e:
                    logger.error(f"수집 중 오류: {e}")
                    db.session.rollback()
                    continue

            logger.info(f"=== '{query}' 키워드 수집 완료 ===\n")

        logger.info("=" * 50)
        logger.info(f"전체 수집 완료!")
        logger.info(f"총 수집: {total_collected}개")
        logger.info(f"총 저장: {total_saved}개")
        logger.info(f"총 중복: {total_skipped}개")
        logger.info("=" * 50)

if __name__ == '__main__':
    import sys

    print("6개월간의 의료 기사 수집을 시작합니다...")
    print("주의: 이 작업은 시간이 오래 걸릴 수 있습니다.")

    # 인자가 있으면 자동 실행
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        print("자동 실행 모드로 시작합니다...\n")
    else:
        print("계속하려면 Enter를 누르세요...")
        input()

    collect_historical_articles(months=6)
    print("\n수집이 완료되었습니다!")
