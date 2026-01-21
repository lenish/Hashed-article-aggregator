from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models.comment import Comment
from app.models.article import Article
from app.routes.auth import token_required
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('comments', __name__, url_prefix='/api/comments')


@bp.route('/article/<int:article_id>', methods=['GET'])
def get_article_comments(article_id):
    """기사의 댓글 목록 조회"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': '기사를 찾을 수 없습니다'}), 404

        comments = Comment.query.filter_by(article_id=article_id)\
            .order_by(Comment.created_at.desc()).all()

        return jsonify([comment.to_dict() for comment in comments])

    except Exception as e:
        logger.error(f"댓글 조회 중 오류: {e}")
        return jsonify({'error': '댓글 조회 실패'}), 500


@bp.route('/article/<int:article_id>', methods=['POST'])
@token_required
def create_comment(current_user, article_id):
    """댓글 작성"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': '기사를 찾을 수 없습니다'}), 404

        data = request.get_json()
        content = data.get('content')

        if not content or not content.strip():
            return jsonify({'error': '댓글 내용을 입력하세요'}), 400

        comment = Comment(
            content=content.strip(),
            article_id=article_id,
            author_id=current_user.id
        )
        db.session.add(comment)
        db.session.commit()

        return jsonify({
            'message': '댓글이 작성되었습니다',
            'comment': comment.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"댓글 작성 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': '댓글 작성 실패'}), 500


@bp.route('/<int:comment_id>', methods=['PUT'])
@token_required
def update_comment(current_user, comment_id):
    """댓글 수정"""
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'error': '댓글을 찾을 수 없습니다'}), 404

        # 작성자만 수정 가능
        if comment.author_id != current_user.id:
            return jsonify({'error': '수정 권한이 없습니다'}), 403

        data = request.get_json()
        content = data.get('content')

        if not content or not content.strip():
            return jsonify({'error': '댓글 내용을 입력하세요'}), 400

        comment.content = content.strip()
        db.session.commit()

        return jsonify({
            'message': '댓글이 수정되었습니다',
            'comment': comment.to_dict()
        })

    except Exception as e:
        logger.error(f"댓글 수정 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': '댓글 수정 실패'}), 500


@bp.route('/<int:comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, comment_id):
    """댓글 삭제"""
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'error': '댓글을 찾을 수 없습니다'}), 404

        # 작성자 또는 관리자만 삭제 가능
        if comment.author_id != current_user.id and current_user.role != 'admin':
            return jsonify({'error': '삭제 권한이 없습니다'}), 403

        db.session.delete(comment)
        db.session.commit()

        return jsonify({'message': '댓글이 삭제되었습니다'})

    except Exception as e:
        logger.error(f"댓글 삭제 중 오류: {e}")
        db.session.rollback()
        return jsonify({'error': '댓글 삭제 실패'}), 500
