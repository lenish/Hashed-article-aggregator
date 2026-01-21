# 해시드(Hashed) 뉴스 애그리게이터

해시드(Hashed) 관련 뉴스를 매일 자동으로 수집하고 정리하여 보여주는 웹 애플리케이션입니다.

## 주요 기능

- 네이버 뉴스 API를 통한 해시드 관련 기사 자동 수집
- 하이브리드 방식(키워드 + AI)의 기사 분류
- 매일 정해진 시간에 자동 수집 (기본값: 오전 9시)
- 카테고리별 기사 분류
- 통계 대시보드
- 카테고리별 필터링

## 검색 키워드

- 해시드
- Hashed
- 해시드 벤처스
- 주식회사 해시드
- 김서준

## 기술 스택

### Backend
- Python 3.9+
- Flask
- PostgreSQL
- SQLAlchemy
- APScheduler (스케줄링)
- Naver News API

### Frontend
- React 18
- Material-UI
- Vite
- Axios

## 설치 및 실행

### 1. 사전 준비

- Python 3.9 이상
- Node.js 18 이상
- Docker & Docker Compose (PostgreSQL용)
- Naver 개발자 계정 및 API 키

### 2. Naver API 키 발급

1. [Naver Developers](https://developers.naver.com)에 접속
2. 애플리케이션 등록
3. 검색 API 사용 설정
4. Client ID와 Client Secret 발급

### 3. 데이터베이스 실행

```bash
# Docker Compose로 PostgreSQL 실행
docker-compose up -d
```

### 4. Backend 설정 및 실행

```bash
# backend 디렉토리로 이동
cd backend

# Python 가상환경 생성
python -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 Naver API 키 입력

# Flask 앱 실행
python run.py
```

Backend는 `http://localhost:5000`에서 실행됩니다.

### 5. Frontend 설정 및 실행

```bash
# frontend 디렉토리로 이동
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

Frontend는 `http://localhost:3000`에서 실행됩니다.

## 환경 변수 설정

`backend/.env` 파일에 다음 값들을 설정하세요:

```env
# Flask 설정
SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# 데이터베이스
DATABASE_URL=postgresql://hasheduser:hashedpass@localhost:5432/hashed_articles_db

# Naver API
NAVER_CLIENT_ID=your-client-id
NAVER_CLIENT_SECRET=your-client-secret
```

## API 엔드포인트

### 기사 관련
- `GET /api/articles/` - 기사 목록 조회 (페이지네이션, 카테고리 필터)
- `GET /api/articles/today` - 오늘의 기사 조회
- `GET /api/articles/{id}` - 특정 기사 상세 조회
- `GET /api/articles/categories` - 카테고리 목록
- `GET /api/articles/stats` - 통계 정보

### 스케줄러
- `POST /api/scheduler/collect` - 수동으로 기사 수집 실행
- `GET /api/scheduler/status` - 스케줄러 상태 확인

## 프로젝트 구조

```
Hashed-article-aggregator/
├── backend/
│   ├── app/
│   │   ├── models/          # 데이터베이스 모델
│   │   ├── routes/          # API 라우트
│   │   ├── services/        # 비즈니스 로직
│   │   └── __init__.py
│   ├── config.py            # 설정 파일
│   ├── run.py              # 앱 실행 파일
│   └── requirements.txt     # Python 패키지
├── frontend/
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── services/       # API 서비스
│   │   └── styles/         # CSS 스타일
│   ├── index.html
│   └── package.json
├── docker-compose.yml      # PostgreSQL 설정
└── README.md
```

## 라이선스

MIT License
