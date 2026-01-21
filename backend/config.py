import os
from dotenv import load_dotenv

load_dotenv()

def get_database_url():
    """DATABASE_URL을 psycopg3 형식으로 변환"""
    url = os.environ.get('DATABASE_URL')
    if url:
        # Render의 postgres:// 를 postgresql+psycopg:// 로 변환
        if url.startswith('postgres://'):
            url = url.replace('postgres://', 'postgresql+psycopg://', 1)
        elif url.startswith('postgresql://'):
            url = url.replace('postgresql://', 'postgresql+psycopg://', 1)
        return url
    return 'sqlite:///hashed_articles.db'

class Config:
    """기본 설정"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = get_database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Naver News API 설정
    NAVER_CLIENT_ID = os.environ.get('NAVER_CLIENT_ID')
    NAVER_CLIENT_SECRET = os.environ.get('NAVER_CLIENT_SECRET')

    # 스케줄러 설정
    SCHEDULER_API_ENABLED = True

    # 해시드 관련 키워드
    SEARCH_KEYWORDS = [
        '해시드', 'Hashed', '해시드 벤처스', '주식회사 해시드', '김서준'
    ]

    # 기사 수집 설정
    MAX_ARTICLES_PER_DAY = 500  # 100에서 500으로 증가
    ARTICLE_COLLECTION_TIME = "09:00"  # 매일 수집 시간

class DevelopmentConfig(Config):
    """개발 환경 설정"""
    DEBUG = True

class ProductionConfig(Config):
    """운영 환경 설정"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
