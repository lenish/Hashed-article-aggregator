from datetime import datetime
from app import db


class Comment(db.Model):
    """댓글 모델"""
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)

    # 관계
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # 메타데이터
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계 정의
    article = db.relationship('Article', backref=db.backref('comments', lazy='dynamic'))

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            'id': self.id,
            'content': self.content,
            'article_id': self.article_id,
            'author_id': self.author_id,
            'author': self.author.to_dict() if self.author else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Comment {self.id} by {self.author_id}>'
