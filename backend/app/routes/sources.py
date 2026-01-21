from flask import Blueprint, jsonify
from app.models.article import Article
from app import db
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('sources', __name__, url_prefix='/api/sources')

@bp.route('/', methods=['GET'])
def get_sources():
    """언론사 목록 조회"""
    try:
        sources = db.session.query(Article.source).filter(
            Article.is_medical == True,
            Article.source.isnot(None)
        ).distinct().all()

        source_list = [src[0] for src in sources]

        return jsonify({
            'sources': sorted(source_list)
        })

    except Exception as e:
        logger.error(f"언론사 조회 중 오류: {e}")
        return jsonify({'error': '언론사 조회 실패'}), 500
