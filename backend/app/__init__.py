from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import config

db = SQLAlchemy()

def create_app(config_name='default'):
    """Flask 애플리케이션 팩토리"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # 확장 초기화
    db.init_app(app)

    # CORS 설정 - 모든 도메인 허용
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })

    # 블루프린트 등록
    from app.routes import articles, scheduler, sources
    app.register_blueprint(articles.bp)
    app.register_blueprint(scheduler.bp)
    app.register_blueprint(sources.bp)

    # 데이터베이스 초기화
    with app.app_context():
        db.create_all()

    return app
