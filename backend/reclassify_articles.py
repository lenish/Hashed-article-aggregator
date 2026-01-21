"""기존 기사를 새로운 분류 시스템으로 재분류"""
from app import create_app, db
from app.services.article_classifier import ArticleClassifier
from app.models.article import Article
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = create_app()

with app.app_context():
    search_keywords = app.config.get('SEARCH_KEYWORDS')
    classifier = ArticleClassifier(search_keywords)

    # 모든 의료 기사 가져오기
    articles = Article.query.filter_by(is_medical=True).all()

    logger.info(f"재분류할 기사: {len(articles)}개")

    updated_count = 0

    for article in articles:
        # 재분류
        is_medical, category, confidence, keywords = classifier.classify_article(
            article.title,
            article.description or ""
        )

        # 업데이트
        article.category = category
        article.confidence_score = confidence
        article.keywords = keywords

        updated_count += 1

        if updated_count % 10 == 0:
            logger.info(f"진행: {updated_count}/{len(articles)}")

    db.session.commit()

    logger.info(f"재분류 완료: {updated_count}개 업데이트됨")

    # 카테고리별 통계
    category_stats = db.session.query(
        Article.category,
        db.func.count(Article.id)
    ).filter(
        Article.is_medical == True
    ).group_by(Article.category).all()

    logger.info("\n카테고리별 통계:")
    for category, count in category_stats:
        logger.info(f"  {category}: {count}개")
