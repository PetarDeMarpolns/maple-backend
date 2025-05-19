# 🎯 Maple Event Reward API
이 프로젝트는 메이플스토리 IP를 기반으로 한 백엔드 서버로써,
이벤트 참여 및 보상 수령 시스템을 구현하였습니다.
NestJS + MSA + MongoDB를 기반으로 하며, USER/OPERATOR/AUDITOR/ADMIN 권한 분기를 통해 이벤트와 보상 로직을 분리하여 운영할 수 있습니다.

각 서버의 API 호출 서비스와 DB구조를 분리 시킨 것만만 보면 분명히 MSA입니다.
하지만, API의 진입점이 Gateway 서버 하나인 것과 HTTP 프록시로 각 서버에 라우팅하는 구조라는 것을 고려하면 운영 환경을 제한 아키텍처 관점에서만 MSA구조를 띄고 있습니다.

💡Auth서버는 port넘버 3000, Gateway서버는 3001, Event서버는 3002에서 진행하였으며,
  모든 API의 진입 요청점은 명세에 따라 3001번인 Gateway서버에서 진입할 수 있습니다.
  각각의 DB의 정보는 해당 서버의 .env파일에 첨부하였습니다. (MongoDB 사용)

💡이벤트 조건 달성은 OPERATOR와 ADMIN이 event-db의 ConditionMet 변수를 수동으로 바꿔야 합니다.
  README.md의 최하단부 "발전 가능 사항"에 기술해 놓았으니 참고 부탁드립니다.


---


## 📦  기술 스택
- Framework: **NestJS**
- Database: **MongoDB**
- 인증: **JWT 기반 인증**
- 권한 관리: **RolesGuard / Decorator**


---


## 🐳 Docker Compose 실행 방법
docker-compose.yml을 프로젝트의 루트에 첨부해두었습니다.
루트 디렉토리에서 'docker-compose up -d' 로 백그라운드 실행을 한 후

---




## 👥 역할 및 권한 정의
| USER | 이벤트 참여 및 보상 수령 가능 | 🟢 일반 사용자 

| OPERATOR | 보상 등록/수정 가능 | 🟡 중간 관리자

| AUDITOR | 참여 현황, 보상 요청 로그 열람 가능 | 🔵 감사 전용

| ADMIN | 이벤트 등록, 보상 등록/수정, 로그 조회 등 전체 권한 | 🔴 전체 권한

💡역할은 @Roles() 데코레이터 기반으로 제어되며, JWT 토큰 내 포함된 role 정보를 기준으로 접근 제어됩니다.


---


## ✅ 핵심 기능
### 🟢Auth Server (auth-server)
회원가입, 로그인, JWT 발급, 역할(Role) 기반 권한 제어 담당

✅ 유저 등록 : 기본 유저 계정 등록 API

✅ 로그인 : 로그인 시 JWT 액세스 토큰 발급

✅ 역할 관리 : JWT에 role 포함 (USER,OPERATOR,AUDITOR,ADMIN)

✅ 역할별 접근 제어

    - USER → 보상 요청 가능
    
    - ADMIN → 이벤트/보상 등록 가능
    
    - OPERATOR → 전체 기능 접근 가능
    
    - AUDITOR → 보상 이력 열람 가능


### 🟡 Event Server (event-server)
이벤트 생성, 참여, 보상 등록 및 수령, 보상 이력 관리 담당

✅ 이벤트 생성 : 운영자 또는 관리자가 이벤트 등록

✅ 이벤트 목록 조회 : 모든 유저가 전체 이벤트 확인 가능

✅ 보상 등록 : 이벤트별 보상 정보 등록 및 수정 (OPERATOR/ADMIN 전용)

✅ 유저 보상 요청 : 유저는 참여한 이벤트에 대해 보상 요청 가능

✅ 조건 검증 : 보상 수령 전 시스템에서 조건 충족 여부 검증

✅ 중복 방지 : 이미 보상 수령 시 재요청 방지

✅ 로그 기록 : 모든 보상 요청에 대한 기록 저장 (RewardLog)


### 🔵 Gateway Server (gateway-server)
모든 외부 요청의 진입점, 인증 및 권한 검사, 서비스 간 라우팅 처리

✅ 요청 프록시 : /auth/*, /events/* 요청을 각 서비스로 라우팅

✅ 인증 처리 : 요청 시 Authorization 헤더 내 JWT 유효성 검사

✅ 역할 검사 : JWT 내 role을 기반으로 API 접근 권한 판단


---


## 🔐 인증 및 인가

- 모든 민감 API는 `JwtAuthGuard`로 보호되며,
- 역할 기반 접근 제어는 `@Roles()` 및 `RolesGuard`로 처리됩니다.
- JWT 토큰은 로그인 후 발급되며, `Authorization: Bearer <token>` 형식으로 요청 시 사용됩니다.

💡 Gateway 서버의 인증/인가 모듈이 정상적으로 작동하는지 확인하기 위하여 gateway-server/src/auth/auth.controller.ts 내 테스트용 API(/test/public, /test/admin, /test/profile)를 구성하여 다음 항목을 검증하였습니다.
1. JWT 토큰이 없는 사용자는 보호된 API 접근 불가 (`JwtAuthGuard`)
2. 역할이 일치하지 않으면 접근이 차단됨 (`RolesGuard`)
3. 토큰에서 디코딩된 유저 정보가 `req.user`에 정확히 매핑됨


---


## 📡 주요 API 목록
### 🟢 Auth Server (/auth)

| POST      | /auth/register    | 사용자 회원가입

| POST      | /auth/login       | 로그인/JWT발급

### 🟡 Event Server (/events)
📘 유저 API (✅:인증 토큰 필요)

| GET    | /events                       | 전체 이벤트 목록 조회

| GET    | /events/<eventId>/status      | 자신의 이벤트 참여 여부 및 보상 수령 여부 조회    | ✅ USER |

| GET    | /events/mine                  | 자신이 참여한 이벤트 목록 조회              | ✅ USER |

| POST   | /events/<eventId>/participate | 특정 이벤트에 참여 요청                  | ✅ USER |

| POST   | /events/<eventId>/reward      | 보상 수령 요청 (조건 충족 여부 검증 및 중복 방지) | ✅ USER |

🔴 관리자 / 운영자 API (✅:인증 토큰 필요)

| POST   | /events                          | 이벤트 생성            | ✅OPERATOR,ADMIN

| POST   | /events/<eventId>/reward-setting | 이벤트 보상 등록         | ✅OPERATOR,ADMIN

| PUT    | /events/<eventId>/reward         | 이벤트 보상 수정         | ✅OPERATOR,ADMIN

| GET    | /events/<eventId>/participants   | 해당 이벤트 참여자 목록 조회  | ✅AUDITOR,ADMIN

| GET    | /events/all/participations       | 전체 참여 기록 조회       | ✅OPERATOR,AUDITOR,ADMIN

| GET    | /events/logs/reward-requests     | 보상 수령 요청 로그 전체 조회 | ✅AUDITOR,ADMIN


---


## 🛠 DB 구조 요약
### 📄 User (필수 : ✅)
| username | string    | 유저 ID (고유)                      | ✅

| password | string    | 비밀번호 (암호화된 문자열)            | ✅

| roles    | string\[] | 유저 역할 목록                      | ✅

### 📄 Event (필수 : ✅)
| title       | string | 이벤트 제목                     | ✅

| description | string | 이벤트 설명                     | ✅

| condition   | string | 보상 조건 설명                   | ✅

| startDate   | Date   | 이벤트 시작일                    | ✅

| endDate     | Date   | 이벤트 종료일                    | ✅

| reward      | object | 보상 정보 (`item`, `quantity`) | ✅  | { item: '', quantity: '' }

| createdAt   | Date   | 생성일 (자동 생성)                | -  | 시스템 자동 생성

| updatedAt   | Date   | 수정일 (자동 생성)                | -  | 시스템 자동 생성

### 📄 Participation (필수 : ✅)
| userId        | string   | 참여한 유저의 ID                   | ✅

| eventId       | ObjectId | 이벤트 ID (Event와 참조 관계)        | ✅

| rewardClaimed | boolean  | 보상 수령 여부                     | 기본값 : false

| conditionMet  | number   | 조건 충족 여부 (`0`: 미충족, `1`: 충족) | 기본값 : 0

| createdAt     | Date     | 생성일                          | 시스템 자동 생성

| updatedAt     | Date     | 수정일                          | 시스템 자동 생성

### 📄 RewardRequestLog (필수 : ✅)
| userId    | string   | 요청한 유저 ID           | ✅

| eventId   | ObjectId | 이벤트 ID (Event 참조)   | ✅

| status    | enum     | 요청 상태 (`SUCCESS`, `ALREADY_CLAIMED`, `NOT_PARTICIPATED`, `CONDITION_NOT_MET`) | ✅ (상태 기록) 

| message   | string   | 실패 사유 등의 설명  | (선택사항)

| reward    | object   | 보상 정보 (`item`, `quantity) |(성공 시만 기록 가능)

| createdAt | Date     | 로그 생성 시간             | (시스템 자동 생성)


---


## ✅ 보상 수령 조건

- 유저가 이벤트에 `participate` 했고
- 해당 participation에 `conditionMet = 1`로 설정되어 있어야
- `POST /events/:id/reward` 호출 시 `"보상을 수령했습니다!"` 응답이 반환됨


---


## ✅ 테스트 시나리오

1. `/auth/login` → JWT 토큰 발급
2. `POST /events` → 관리자 이벤트 생성
3. `POST /events/:id/reward-setting` → 관리자 보상 등록
4. `POST /events/:id/participate` → 유저 이벤트 참여
5. DB에서 `conditionMet: 1` 을 수동으로 변경
6. <MongoShell console>
   
        db.participations.updateOne(
   
            { userId: "<userid>", eventId: ObjectId("<eventid>") },
   
            { $set: { conditionMet: 1 } }
   
        )
   
8. `POST /events/:id/reward` → 유저 보상 수령
9. `GET /events/logs/reward-requests` → 관리자 로그 확인

💡 단위테스트를 위해 postman을 사용하여 각 서버에 raw JSON쿼리를 날려보았습니다.


---


## 📂 주요 폴더 구조
maple-backend/

├── gateway-server/
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── proxy.controller.ts         # 이벤트/인증 요청 프록시 처리
│       ├── auth.controller.ts          # 인증 테스트용 API (JwtAuthGuard, RolesGuard 검증용)
│       └── common/
│           ├── guards/
│           │   ├── jwt-auth.guard.ts
│           │   └── roles.guard.ts
│           └── decorators/
│               └── roles.decorator.ts

├── auth-server/
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       └── modules/
│           └── auth/
│               ├── auth.controller.ts       # 로그인, 회원가입, JWT 발급
│               ├── auth.service.ts
│               ├── auth.module.ts
│               ├── dto/
│               │   ├── create-user.dto.ts
│               │   └── login.dto.ts
│               ├── schemas/
│               │   └── user.schema.ts
│               └── strategy/
│                   └── jwt.strategy.ts

├── event-server/
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       └── modules/
│           └── event/
│               ├── event.controller.ts      # 이벤트/참여/보상/로그 API
│               ├── event.service.ts
│               ├── event.module.ts
│               ├── dto/
│               │   ├── create-event.dto.ts
│               │   └── create-reward.dto.ts
│               └── schemas/
│                   ├── event.schema.ts
│                   ├── participation.schema.ts
│                   └── reward-log.schema.ts


---


## ❗ 어려웠던 점
### 환경 변수 주입 문제
.env 파일을 구성하였으나, NestJS의 ConfigModule과 제대로 연결되지 않아 auth.module.ts 내에서 JwtModule.registerAsync()를 활용하고 ConfigService를 통해 직접 환경 변수를 주입하는 방식으로 해결하였습니다.

### Gateway 프록시 설정
API 진입점을 gateway-server로 통합하면서 인증 서버(auth-server) 및 이벤트 서버(event-server)로의 HTTP 중계가 필요해졌고, 이를 위해 처음 사용해보는 @nestjs/axios를 도입했습니다.

프록시 구현 과정에서 Content-Length 헤더 문제로 인해 요청이 중간에 끊기는 이슈가 발생했으며, 원인을 분석하고 헤더를 제거하거나 수정하는 방식으로 대응하였습니다.

이러한 구조는 MSA 기반이었기 때문에 의존성이나 로직 결합도가 낮아, 리팩토링 과정은 예상보다 수월하게 진행되었습니다.


---


## 🚀 발전 가능 사항
### 보상 조건 검증 로직의 실제 구현 미흡
현재는 보상 조건이 단순히 conditionMet: true로 수동 설정하는 구조라서, 실제로 조건을 충족했는지에 대한 로직 검증은 포함되어 있지 않습니다.

예를 들어, “7일 연속 출석”과 같은 조건은 단순히 Boolean으로 처리되고 있으나, 실제로 7일 간의 출석 여부를 기록하고 검증하는 시스템은 구현되어 있지 않습니다.

추후 보상 조건을 동적으로 평가할 수 있는 이벤트 트래킹 시스템과 Rule Engine을 도입하면 더 정교한 이벤트 운영이 될 것입니다.


---


## 📮 작성자
구현자: 염한울 (yhu8307@naver.com)
