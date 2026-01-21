import os
import logging
from app import create_app, db
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.news_collector import NewsCollector
from app.services.article_classifier import ArticleClassifier
from app.models.article import Article
from sqlalchemy import text, inspect

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Flask 앱 생성
app = create_app(os.getenv('FLASK_ENV', 'development'))


def run_migrations():
    """Run database migrations to add missing columns"""
    with app.app_context():
        try:
            logger.info("Checking database schema...")

            with db.engine.connect() as connection:
                inspector = inspect(connection)
                tables = inspector.get_table_names()

                if 'articles' not in tables:
                    logger.info("Creating all tables...")
                    db.create_all()
                    logger.info("All tables created successfully!")
                    return

                # Get existing columns
                columns = inspector.get_columns('articles')
                existing_columns = [col['name'] for col in columns]

                # Define columns to add
                columns_to_add = [
                    ('sentiment', 'VARCHAR(20)', None),
                    ('needs_response', 'BOOLEAN', 'FALSE'),
                    ('risk_level', 'VARCHAR(20)', "'green'"),
                    ('risk_score', 'INTEGER', '0'),
                    ('status', 'VARCHAR(20)', "'pending'"),
                    ('assignee_id', 'INTEGER', None),
                    ('ai_summary', 'TEXT', None),
                    ('ai_risk_analysis', 'TEXT', None),
                    ('action_items', 'JSONB', None),
                    ('similar_cases', 'JSONB', None),
                    ('resolved_at', 'TIMESTAMP', None),
                    ('resolved_by_id', 'INTEGER', None),
                ]

                added_count = 0
                for col_name, col_type, default in columns_to_add:
                    if col_name not in existing_columns:
                        default_clause = f" DEFAULT {default}" if default else ""
                        sql = f"ALTER TABLE articles ADD COLUMN {col_name} {col_type}{default_clause}"
                        connection.execute(text(sql))
                        logger.info(f"Added column: {col_name}")
                        added_count += 1

                if added_count > 0:
                    connection.commit()
                    logger.info(f"Migration completed: {added_count} columns added")
                else:
                    logger.info("Database schema is up to date")

        except Exception as e:
            logger.error(f"Migration error: {e}")
            # Don't raise - allow app to continue


# Run migrations on startup
run_migrations()

def scheduled_article_collection():
    """스케줄된 기사 수집 작업"""
    with app.app_context():
        try:
            logger.info("=== 스케줄된 기사 수집 시작 ===")

            # 설정 가져오기
            client_id = app.config.get('NAVER_CLIENT_ID')
            client_secret = app.config.get('NAVER_CLIENT_SECRET')
            search_keywords = app.config.get('SEARCH_KEYWORDS')
            max_articles = app.config.get('MAX_ARTICLES_PER_DAY')

            if not client_id or not client_secret:
                logger.error("Naver API 설정이 없습니다. .env 파일을 확인하세요.")
                return

            # 기사 수집
            collector = NewsCollector(client_id, client_secret)
            articles = collector.collect_medical_articles(max_articles=max_articles)

            # 의료 기사 분류
            classifier = ArticleClassifier(search_keywords)
            medical_articles = classifier.batch_classify(articles)

            # 데이터베이스 저장
            saved_count = 0
            skipped_count = 0

            for article_data in medical_articles:
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

            logger.info(f"=== 기사 수집 완료 === 수집: {len(articles)}, 의료: {len(medical_articles)}, 저장: {saved_count}, 중복: {skipped_count}")

        except Exception as e:
            logger.error(f"스케줄된 기사 수집 중 오류: {e}")
            db.session.rollback()

# 스케줄러 설정
scheduler = BackgroundScheduler()
collection_time = app.config.get('ARTICLE_COLLECTION_TIME', '09:00')
hour, minute = map(int, collection_time.split(':'))

# 매일 지정된 시간에 기사 수집
scheduler.add_job(
    func=scheduled_article_collection,
    trigger='cron',
    hour=hour,
    minute=minute,
    id='daily_article_collection',
    name='매일 의료 기사 수집',
    replace_existing=True
)

scheduler.start()
logger.info(f"스케줄러 시작: 매일 {collection_time}에 기사 수집")

if __name__ == '__main__':
    try:
        port = int(os.environ.get('PORT', 5001))
        app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("스케줄러 종료")
