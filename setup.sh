#!/bin/bash

echo "의료 뉴스 애그리게이터 설치 스크립트"
echo "======================================"
echo ""

# 1. PostgreSQL 실행
echo "1. PostgreSQL 컨테이너 시작..."
docker-compose up -d

# 대기
sleep 3

# 2. Backend 설정
echo ""
echo "2. Backend 설정..."
cd backend

# 가상환경이 없으면 생성
if [ ! -d "venv" ]; then
    echo "Python 가상환경 생성 중..."
    python3 -m venv venv
fi

# 가상환경 활성화
echo "가상환경 활성화..."
source venv/bin/activate

# 패키지 설치
echo "Python 패키지 설치 중..."
pip install -r requirements.txt

# .env 파일이 없으면 생성
if [ ! -f ".env" ]; then
    echo ".env 파일 생성 중..."
    cp .env.example .env
    echo ""
    echo "⚠️  .env 파일을 열어서 Naver API 키를 입력해주세요!"
    echo ""
fi

cd ..

# 3. Frontend 설정
echo ""
echo "3. Frontend 설정..."
cd frontend

# 패키지 설치
echo "Node.js 패키지 설치 중..."
npm install

# .env 파일이 없으면 생성
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

cd ..

echo ""
echo "======================================"
echo "설치 완료!"
echo ""
echo "다음 단계:"
echo "1. backend/.env 파일을 열어서 Naver API 키 입력"
echo "2. Backend 실행: cd backend && source venv/bin/activate && python run.py"
echo "3. Frontend 실행: cd frontend && npm run dev"
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "======================================"
