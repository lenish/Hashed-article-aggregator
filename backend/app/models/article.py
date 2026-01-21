from datetime import datetime
from app import db

class Article(db.Model):
    """뉴스 기사 모델"""
    __tablename__ = 'articles'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    content = db.Column(db.Text)
    url = db.Column(db.String(1000), unique=True, nullable=False)
    source = db.Column(db.String(100))  # 출처 (네이버, 조선일보 등)
    author = db.Column(db.String(100))
    published_date = db.Column(db.DateTime)

    # 분류 정보
    is_medical = db.Column(db.Boolean, default=False)
    category = db.Column(db.String(50))  # 의료 카테고리 (병원, 제약, 정책 등)
    keywords = db.Column(db.JSON)  # 추출된 키워드
    confidence_score = db.Column(db.Float)  # AI 분류 신뢰도

    # 메타데이터
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'content': self.content,
            'url': self.url,
            'source': self.source,
            'author': self.author,
            'published_date': self.published_date.isoformat() if self.published_date else None,
            'is_medical': self.is_medical,
            'category': self.category,
            'keywords': self.keywords,
            'confidence_score': self.confidence_score,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Article {self.title[:30]}...>'
