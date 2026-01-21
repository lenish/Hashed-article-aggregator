from datetime import datetime
from app import db


class User(db.Model):
    """사용자 모델 - Google OAuth 인증"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100))
    picture = db.Column(db.String(500))
    google_id = db.Column(db.String(100), unique=True)

    # 권한 및 상태
    is_active = db.Column(db.Boolean, default=True)
    role = db.Column(db.String(20), default='user')  # admin, user

    # 메타데이터
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)

    # 관계
    assigned_articles = db.relationship('Article', backref='assignee', lazy='dynamic',
                                        foreign_keys='Article.assignee_id')
    comments = db.relationship('Comment', backref='author', lazy='dynamic')

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'picture': self.picture,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

    def __repr__(self):
        return f'<User {self.email}>'
