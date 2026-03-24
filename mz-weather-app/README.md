# 🌤 MZ Weather App

실시간 날씨 정보를 제공하는 한국어 기반 웹 앱입니다.
Glassmorphism 디자인과 MET Norway 기상 데이터를 활용하여 현재 날씨, 대기질, 12시간 예보를 한눈에 확인할 수 있습니다.

---

## 미리보기

- 현재 위치 자동 감지 (GPS)
- 현재 날씨 · 기온 · 바람 · 습도 표시
- 미세먼지(PM10) / 초미세먼지(PM2.5) 대기질 정보
- 지금부터 12시간 예보 (시간별 스크롤)

---

## 기술 스택

| 분류 | 내용 |
|------|------|
| 언어 | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| 스타일 | Glassmorphism, CSS 변수, Flexbox/Grid, 애니메이션 |
| 폰트 | [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts), [Pretendard](https://cdn.jsdelivr.net/npm/pretendard) |
| 아이콘 | [Lucide Icons](https://lucide.dev) (CDN) |
| 빌드 도구 | 없음 (순수 정적 파일) |

---

## 사용 API

| API | 용도 | 인증 |
|-----|------|------|
| [MET Norway Locationforecast 2.0](https://api.met.no) | 시간별 기온, 날씨 상태, 바람, 습도 | 불필요 |
| [Open-Meteo Air Quality](https://air-quality-api.open-meteo.com) | PM10 / PM2.5 현재 수치 | 불필요 |
| [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org) | 좌표 → 한국어 지명 변환 | 불필요 |
| [MET Norway Weather Icons](https://github.com/metno/weathericons) | SVG 날씨 아이콘 (GitHub Raw) | 불필요 |
| Browser Geolocation API | 현재 위치(위도/경도) 획득 | 브라우저 권한 |

---

## 주요 기능

### 현재 날씨
- 현재 기온 (°C)
- 날씨 상태 텍스트 (한국어, 40여 가지 날씨 코드 지원)
- 날씨 아이콘 (MET Norway SVG)
- 바람 속도 (m/s) / 습도 (%)

### 대기질 (AQI)
- PM10 · PM2.5 수치 표시
- 상태 자동 분류 및 색상 표시

| 상태 | 기준 (PM10 / PM2.5) | 색상 |
|------|----------------------|------|
| 좋음 | ≤30 / ≤15 µg/m³ | 초록 |
| 보통 | ≤80 / ≤35 µg/m³ | 주황 |
| 나쁨 | ≤150 / ≤75 µg/m³ | 빨강 |
| 매우나쁨 | 초과 | 파랑 |

### 12시간 예보
- 현재 시각("지금")부터 12시간 후까지 1시간 단위 표시
- 수평 스크롤 캐러셀
- 각 항목: 시각 · 날씨 아이콘 · 기온

---

## 프로젝트 구조

```
mz-weather-app/
├── index.html      # 앱 마크업 (단일 페이지)
├── app.js          # 핵심 로직 (데이터 fetch, UI 렌더링)
├── styles.css      # 스타일 및 애니메이션
└── README.md
```

---

## 실행 방법

별도의 설치나 빌드 과정이 필요 없습니다.

```bash
# 1. 저장소 클론
git clone <repo-url>
cd mz-weather-app

# 2. index.html을 브라우저로 열기
# - 로컬 파일로 직접 열거나
# - VS Code Live Server 등 로컬 서버 사용 권장
#   (Geolocation API는 HTTPS 또는 localhost 환경 필요)
```

> **권장 환경:** Chrome / Edge / Safari 최신 버전
> Geolocation 사용을 위해 브라우저에서 위치 권한을 허용해야 합니다.
> 위치 권한 거부 시 기본값으로 **서울(37.5665, 126.9780)**이 사용됩니다.

---

## 데이터 흐름

```
페이지 로드
  └─ DOMContentLoaded
       └─ Geolocation 요청 (타임아웃 10초)
            ├─ 성공 → Nominatim으로 지명 조회
            └─ 실패 → 서울 좌표 사용
                  └─ MET Norway + Open-Meteo 병렬 fetch (Promise.all)
                        └─ UI 렌더링 (날씨 · 대기질 · 12시간 예보)
```

---

## 디자인 시스템

- **배경:** 3개의 부유하는 그라디언트 오브 (drift 애니메이션)
- **패널:** Glassmorphism (`backdrop-filter: blur(28px)`)
- **주요 색상:**

| 역할 | 값 |
|------|----|
| 기본 텍스트 | `#ffffff` |
| 보조 텍스트 | `rgba(255,255,255,0.7)` |
| 패널 배경 | `rgba(20,20,30,0.4)` |
| 액센트 (청록) | `#00cec9` |
| 액센트 (보라) | `#6c5ce7` |

---

## 브라우저 지원

- ES6+ (async/await, Fetch API, Optional chaining)
- CSS `backdrop-filter` 지원 브라우저
- Geolocation API 지원 브라우저

> Internet Explorer는 지원하지 않습니다.

---

## 라이선스

본 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.
사용된 외부 API 및 리소스는 각 서비스의 이용약관을 따릅니다.
