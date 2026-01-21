# 배포 가이드 (Deployment Guide)

이 프로젝트는 프론트엔드(React)와 백엔드(Flask)로 구성되어 있어 각각 별도로 배포해야 합니다.

## 1. 백엔드 배포 (Backend Deployment)

백엔드는 Python Flask 애플리케이션으로, 다음 서비스 중 하나를 사용하여 배포할 수 있습니다:

### 옵션 A: Render (추천)
1. [Render](https://render.com/)에 가입
2. "New +" → "Web Service" 선택
3. GitHub 저장소 연결
4. 설정:
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python run.py`
   - **Environment**: Python 3
5. 환경 변수 설정:
   - `NAVER_CLIENT_ID`: 네이버 API 클라이언트 ID
   - `NAVER_CLIENT_SECRET`: 네이버 API 클라이언트 시크릿
   - `PORT`: 5001

### 옵션 B: Railway
1. [Railway](https://railway.app/)에 가입
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택 후 `backend` 디렉토리 지정
4. 환경 변수 추가 (위와 동일)

### 옵션 C: PythonAnywhere
1. [PythonAnywhere](https://www.pythonanywhere.com/)에 가입
2. 무료 계정으로 Flask 앱 호스팅 가능
3. 코드 업로드 후 WSGI 설정

배포 완료 후 백엔드 URL을 메모해두세요 (예: `https://your-backend.onrender.com`)

## 2. 프론트엔드 배포 (Frontend Deployment on Vercel)

### Vercel 배포 단계:

1. **GitHub 저장소 연결**
   - [Vercel](https://vercel.com/)에 로그인
   - "Add New Project" 클릭
   - GitHub에서 `medical-article-aggregator` 저장소 선택

2. **환경 변수 설정**
   - Vercel 프로젝트 설정에서 Environment Variables로 이동
   - 다음 변수 추가:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     ```
   - 위에서 배포한 백엔드 URL로 교체

3. **배포 설정**
   - Root Directory: 기본값 유지 (프로젝트 루트)
   - Framework Preset: Vite
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`

   또는 `vercel.json` 파일이 자동으로 설정을 처리합니다.

4. **배포**
   - "Deploy" 클릭
   - 빌드가 완료되면 프론트엔드 URL이 생성됩니다

### 환경 변수 업데이트
백엔드 URL이 변경되면:
1. Vercel 프로젝트 → Settings → Environment Variables
2. `VITE_API_URL` 업데이트
3. 프로젝트 재배포

## 3. CORS 설정 확인

백엔드의 `app/__init__.py`에서 CORS 설정이 올바른지 확인:

```python
from flask_cors import CORS

# 프로덕션 환경에서는 특정 도메인만 허용
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://your-frontend-domain.vercel.app",
            "http://localhost:3000"  # 개발용
        ]
    }
})
```

## 4. 데이터베이스

현재 SQLite를 사용하고 있습니다. 프로덕션 환경에서는:
- Render의 PostgreSQL
- Railway의 PostgreSQL
- 또는 별도의 데이터베이스 서비스 (Supabase, PlanetScale 등)

로 마이그레이션하는 것을 권장합니다.

## 5. 스케줄러 설정

백엔드의 APScheduler는 서버가 재시작되면 초기화됩니다. 프로덕션에서는:
- Render Cron Jobs
- Railway Cron
- 또는 별도의 크론 서비스

를 사용하여 `/api/scheduler/collect` 엔드포인트를 주기적으로 호출하세요.

## 문제 해결

### 404 에러
- `vercel.json` 파일이 커밋되었는지 확인
- 빌드 로그에서 에러 확인
- Output Directory가 올바른지 확인 (`frontend/dist`)

### API 연결 실패
- Vercel 환경 변수에서 `VITE_API_URL`이 올바르게 설정되었는지 확인
- 백엔드 URL에 `/api`가 포함되어 있는지 확인
- 백엔드 CORS 설정 확인

### 빌드 실패
- `frontend/package.json`의 dependencies 확인
- Node.js 버전 호환성 확인 (Vercel은 기본적으로 최신 LTS 사용)
