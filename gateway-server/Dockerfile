# Node.js 공식 이미지 기반 (버전은 프로젝트에 맞게 선택)
FROM node:18

# 작업 디렉터리 설정
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 소스코드 전체 복사
COPY . .

# 앱 빌드
RUN npm run build

# 앱 실행
CMD ["node", "dist/main"]

# 포트 (옵션) – 필요 시 명시 가능
EXPOSE 3000
