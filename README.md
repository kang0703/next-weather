# Next.js Weather App

고급스러운 디자인의 실시간 날씨 정보 앱입니다.

## 🚀 주요 기능

- 🌍 전 세계 도시 날씨 검색
- 🌡️ 실시간 온도 (섭씨/화씨 전환)
- 💧 습도, 바람, 가시거리, UV 지수 등 상세 정보
- 🌅 일출/일몰 시간
- 📅 5일 날씨 예보
- 🎨 모던하고 고급스러운 UI/UX
- 📱 반응형 디자인

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Weather API**: OpenWeatherMap

## 📦 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **API 설정**
   - OpenWeatherMap API가 이미 설정되어 있습니다.
   - 무료 플랜으로 분당 60회, 일일 1,000회 API 호출이 가능합니다.

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **브라우저에서 확인**
   - http://localhost:3000 으로 접속

## 🔑 API 정보

- **OpenWeatherMap API**: 이미 설정되어 있음 (무료 플랜)
- **API 제한**: 분당 60회, 일일 1,000회
- **데이터**: 현재 날씨, 5일 예보, 한국어 지원
- **단위**: 섭씨 (metric)

## 📱 사용법

1. 검색창에 도시명 입력 (예: Seoul, Tokyo, New York)
2. 검색 버튼 클릭
3. 실시간 날씨 정보 확인
4. 섭씨/화씨 전환 버튼으로 온도 단위 변경

## 🎨 디자인 특징

- **그라데이션 배경**: 부드러운 블루-인디고-퍼플 그라데이션
- **글래스모피즘**: 반투명 카드와 블러 효과
- **아이콘**: 직관적인 Lucide 아이콘 사용
- **색상**: 각 정보별로 구분되는 색상 체계
- **반응형**: 모바일과 데스크톱 모두 최적화

## 🚨 에러 처리

- API 키 미설정 시 안내 메시지
- 도시를 찾을 수 없을 때 사용자 친화적 메시지
- API 호출 한도 초과 시 안내
- 네트워크 오류 시 재시도 안내

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx      # 앱 레이아웃
│   ├── page.tsx        # 메인 날씨 앱 페이지
│   └── globals.css     # 전역 스타일
```

## 🚀 배포

```bash
# 빌드
npm run build

# Cloudflare Workers에 배포
npm run deploy
```

## 📄 라이선스

MIT License

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.
