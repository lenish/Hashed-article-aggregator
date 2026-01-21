# Vercel 배포 설정 가이드

## 문제: 404 NOT_FOUND 오류

Vercel이 프로젝트 루트에서 빌드를 시도하지만, 실제 프론트엔드는 `frontend` 디렉토리에 있어서 발생하는 문제입니다.

## 해결 방법: Vercel 대시보드에서 Root Directory 설정

### 1단계: Vercel 대시보드 접속

https://vercel.com/dashboard 로 이동

### 2단계: 프로젝트 설정

1. 프로젝트 선택 (medical-article-aggregator)
2. **Settings** 탭 클릭
3. **General** 메뉴 선택

### 3단계: Root Directory 설정

1. **Root Directory** 섹션 찾기
2. **Edit** 버튼 클릭
3. 입력란에 `frontend` 입력
4. **Save** 클릭

### 4단계: 빌드 설정 확인

**Build & Development Settings** 섹션에서:
- **Build Command**: `npm run build` (자동 감지됨)
- **Output Directory**: `dist` (자동 감지됨)
- **Install Command**: `npm install` (자동 감지됨)

### 5단계: 환경 변수 확인

**Environment Variables** 섹션에서:
- **Key**: `VITE_API_URL`
- **Value**: `https://medical-article-aggregator.onrender.com/api`
- **Environments**: Production, Preview, Development 모두 체크

### 6단계: 재배포

1. **Deployments** 탭으로 이동
2. 최신 배포 찾기
3. 우측 메뉴(...) 클릭
4. **Redeploy** 선택
5. **Redeploy** 버튼 클릭

## 배포 후 확인

1. 빌드 로그에서 성공 메시지 확인
2. 배포된 URL로 접속
3. 브라우저 개발자 도구(F12) 열기
4. 콘솔에 오류가 없는지 확인
5. "기사 수집" 버튼 클릭하여 API 연결 테스트

## 예상 결과

- ✅ 페이지가 정상적으로 로드됨
- ✅ UI가 올바르게 표시됨
- ✅ 백엔드 API와 통신 가능 (CORS 해결됨)

## 문제가 계속되는 경우

1. Vercel 빌드 로그 확인
2. 브라우저 콘솔에서 오류 메시지 확인
3. Root Directory가 `frontend`로 올바르게 설정되었는지 재확인
