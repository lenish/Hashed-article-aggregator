from flask import Blueprint, request, jsonify, redirect, current_app, session
from datetime import datetime, timedelta
import jwt
import requests
from functools import wraps
from app import db
from app.models.user import User

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def token_required(f):
    """JWT 토큰 인증 데코레이터"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Authorization 헤더에서 토큰 추출
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # 토큰 검증
            data = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
            if not current_user.is_active:
                return jsonify({'error': 'User is inactive'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated


def generate_token(user):
    """JWT 토큰 생성"""
    payload = {
        'user_id': user.id,
        'email': user.email,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )


@bp.route('/google', methods=['GET'])
def google_auth():
    """Google OAuth 시작 - 프론트엔드 리디렉션 URL 반환"""
    client_id = current_app.config.get('GOOGLE_CLIENT_ID')
    redirect_uri = current_app.config.get('GOOGLE_REDIRECT_URI',
                                          'http://localhost:5001/api/auth/google/callback')

    # Google OAuth URL 생성
    oauth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"access_type=offline&"
        f"prompt=consent"
    )

    return jsonify({'auth_url': oauth_url})


@bp.route('/google/callback', methods=['GET', 'POST'])
def google_callback():
    """Google OAuth 콜백 처리"""
    # GET 요청: code 파라미터로 받음 (서버 리디렉션)
    # POST 요청: JSON body로 받음 (프론트엔드에서 직접 호출)

    if request.method == 'POST':
        data = request.get_json()
        code = data.get('code')
    else:
        code = request.args.get('code')

    if not code:
        return jsonify({'error': 'Authorization code is missing'}), 400

    try:
        # Google에서 access token 받기
        token_response = requests.post(
            'https://oauth2.googleapis.com/token',
            data={
                'code': code,
                'client_id': current_app.config.get('GOOGLE_CLIENT_ID'),
                'client_secret': current_app.config.get('GOOGLE_CLIENT_SECRET'),
                'redirect_uri': current_app.config.get('GOOGLE_REDIRECT_URI',
                                                       'http://localhost:5001/api/auth/google/callback'),
                'grant_type': 'authorization_code'
            }
        )

        if token_response.status_code != 200:
            return jsonify({'error': 'Failed to get access token'}), 400

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        # Google에서 사용자 정보 가져오기
        user_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if user_response.status_code != 200:
            return jsonify({'error': 'Failed to get user info'}), 400

        user_info = user_response.json()
        email = user_info.get('email')

        # 이메일 도메인 검증 (@hashed.com만 허용)
        allowed_domain = current_app.config.get('ALLOWED_EMAIL_DOMAIN', 'hashed.com')
        if not email.endswith(f'@{allowed_domain}'):
            return jsonify({
                'error': 'Unauthorized domain',
                'message': f'Only @{allowed_domain} email addresses are allowed'
            }), 403

        # 사용자 생성 또는 업데이트
        user = User.query.filter_by(email=email).first()

        if not user:
            user = User(
                email=email,
                name=user_info.get('name'),
                picture=user_info.get('picture'),
                google_id=user_info.get('id')
            )
            db.session.add(user)
        else:
            user.name = user_info.get('name')
            user.picture = user_info.get('picture')
            user.google_id = user_info.get('id')

        user.last_login = datetime.utcnow()
        db.session.commit()

        # JWT 토큰 생성
        token = generate_token(user)

        # GET 요청인 경우 프론트엔드로 리디렉션
        if request.method == 'GET':
            frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
            return redirect(f'{frontend_url}/auth/callback?token={token}')

        # POST 요청인 경우 JSON 응답
        return jsonify({
            'token': token,
            'user': user.to_dict()
        })

    except Exception as e:
        current_app.logger.error(f'OAuth error: {str(e)}')
        return jsonify({'error': 'Authentication failed'}), 500


@bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """현재 로그인한 사용자 정보"""
    return jsonify(current_user.to_dict())


@bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """로그아웃 (클라이언트에서 토큰 삭제)"""
    return jsonify({'message': 'Logged out successfully'})


@bp.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    """모든 활성 사용자 목록 (팀 워크플로우용)"""
    users = User.query.filter_by(is_active=True).all()
    return jsonify([user.to_dict() for user in users])


@bp.route('/validate', methods=['GET'])
@token_required
def validate_token(current_user):
    """토큰 유효성 검증"""
    return jsonify({
        'valid': True,
        'user': current_user.to_dict()
    })
