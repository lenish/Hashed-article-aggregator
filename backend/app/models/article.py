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
    category = db.Column(db.String(50))  # 카테고리 (투자, 블록체인, 암호화폐 등)
    keywords = db.Column(db.JSON)  # 추출된 키워드
    confidence_score = db.Column(db.Float)  # AI 분류 신뢰도

    # 감성 분석 및 PR 대응
    sentiment = db.Column(db.String(20))  # positive/negative/neutral
    needs_response = db.Column(db.Boolean, default=False)  # PR 대응 필요 여부

    # 리스크 관리 (Phase 1)
    risk_level = db.Column(db.String(20), default='green')  # red, amber, green
    risk_score = db.Column(db.Integer, default=0)  # 0-100
    status = db.Column(db.String(20), default='pending')  # pending, reviewing, resolved, ignored

    # 담당자 할당
    assignee_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # AI 분석 결과 (Phase 2)
    ai_summary = db.Column(db.Text)  # AI 생성 요약 (3줄)
    ai_risk_analysis = db.Column(db.Text)  # AI 리스크 분석
    action_items = db.Column(db.JSON)  # [{text: string, checked: boolean}]
    similar_cases = db.Column(db.JSON)  # 유사 사례 링크 목록

    # 대응 완료 정보
    resolved_at = db.Column(db.DateTime)
    resolved_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # 메타데이터
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    resolved_by = db.relationship('User', foreign_keys=[resolved_by_id], backref='resolved_articles')

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
            'sentiment': self.sentiment,
            'needs_response': self.needs_response,
            # 리스크 관리 필드
            'risk_level': self.risk_level,
            'risk_score': self.risk_score,
            'status': self.status,
            'assignee_id': self.assignee_id,
            'assignee': self.assignee.to_dict() if self.assignee else None,
            # AI 분석 필드
            'ai_summary': self.ai_summary,
            'ai_risk_analysis': self.ai_risk_analysis,
            'action_items': self.action_items,
            'similar_cases': self.similar_cases,
            # 대응 완료 정보
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolved_by_id': self.resolved_by_id,
            'resolved_by': self.resolved_by.to_dict() if self.resolved_by else None,
            # 메타데이터
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Article {self.title[:30]}...>'
