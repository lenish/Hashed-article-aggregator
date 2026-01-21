from flask import Blueprint, jsonify, current_app
from app.services.news_collector import NewsCollector
from app.services.article_classifier import ArticleClassifier
from app.models.article import Article
from app import db
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('scheduler', __name__, url_prefix='/api/scheduler')

@bp.route('/collect', methods=['POST'])
def collect_articles():
    """기사 수집 수동 실행"""
    try:
        # 설정 가져오기
        client_id = current_app.config.get('NAVER_CLIENT_ID')
        client_secret = current_app.config.get('NAVER_CLIENT_SECRET')
        search_keywords = current_app.config.get('SEARCH_KEYWORDS')
        max_articles = current_app.config.get('MAX_ARTICLES_PER_DAY')

        if not client_id or not client_secret:
            return jsonify({
                'error': 'Naver API 키가 설정되지 않았습니다',
                'message': 'backend/.env 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 설정해주세요. 또는 샘플 데이터를 사용하세요.',
                'docs': 'https://developers.naver.com에서 API 키를 발급받을 수 있습니다.'
            }), 400

        # 1단계: 기사 수집
        collector = NewsCollector(client_id, client_secret)
        articles = collector.collect_medical_articles(max_articles=max_articles)

        logger.info(f"수집된 기사: {len(articles)}개")

        # 2단계: 의료 기사 분류
        classifier = ArticleClassifier(search_keywords)
        medical_articles = classifier.batch_classify(articles)

        logger.info(f"의료 기사: {len(medical_articles)}개")

        # 3단계: 데이터베이스 저장
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

        logger.info(f"저장: {saved_count}개, 중복 스킵: {skipped_count}개")

        return jsonify({
            'success': True,
            'collected': len(articles),
            'medical': len(medical_articles),
            'saved': saved_count,
            'skipped': skipped_count
        })

    except Exception as e:
        logger.error(f"기사 수집 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/status', methods=['GET'])
def get_status():
    """스케줄러 상태 조회"""
    return jsonify({
        'status': 'running',
        'collection_time': current_app.config.get('ARTICLE_COLLECTION_TIME'),
        'max_articles_per_day': current_app.config.get('MAX_ARTICLES_PER_DAY')
    })
