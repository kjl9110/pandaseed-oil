# Pandaseed Oil

유채유 브랜드 'Pandaseed Oil'의 스크롤텔링 웹사이트 (포트폴리오 프로젝트)

## 실행
1. VS Code에서 이 폴더 열기 (파일 > 폴더 열기)
2. 추천 확장 **Live Server** 설치
3. `index.html` 우클릭 > **Open with Live Server**

`index.html`을 더블클릭해 바로 열어도 동작하지만, 수정 사항을 자동 새로고침하려면 Live Server를 권장합니다.

## 구조
```
pandaseed-oil/
├── index.html        마크업 (섹션 순서대로)
├── css/style.css     디자인 토큰(:root) + 섹션별 스타일 + 반응형
├── js/main.js        로더, 장바구니, GSAP ScrollTrigger 스크롤 연출
└── img/              수채 일러스트·판다·병 이미지 (WebP), 파비콘
```

## 섹션 순서
Loader → Hero(창문 속 유채밭) → Intro → Production(4단계) → Our Seeds(유채 식물 → 씨앗 단면) → Health Facts → Our Oils(5종) → Drop(금색 선과 Reserve 병) → Who's Bao? → Footer

## 주요 수정 위치
- 색·폰트: `css/style.css` 상단 `:root`
- 반응형 기준: 1024px(태블릿), 720px(모바일)
- 스크롤 길이: `js/main.js`의 각 `end:'+=000%'` 값 (값이 클수록 장면이 천천히 넘어감)
- 제품 이름·가격: `index.html`의 `.buy` 버튼 `data-name`, `data-price`
- 캐시 갱신: 파일을 바꾸면 `index.html`의 `?v=` 숫자를 올리기

## 사용 라이브러리 (CDN)
- GSAP 3.12.5, ScrollTrigger
- Google Fonts: Gloock, Cormorant Garamond, Courier Prime, Pinyon Script
