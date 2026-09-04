# 연희 스테이 (Yeonhee Stay) 홈페이지

정적 HTML/CSS/JS로 만든 숙소 소개 홈페이지입니다. 빌드 과정 없이 GitHub Pages 같은 무료 정적 호스팅에 그대로 올리면 됩니다.

```
yeonhee-stay/
├── index.html          ← 페이지 본문 (모든 텍스트·사진 주소가 여기 있습니다)
├── admin.html           ← 관리자 페이지 (내용 편집 도구)
├── css/style.css        ← 디자인
├── js/main.js            ← 언어 전환, 예약 링크 반영, 스크롤 효과, 모바일 메뉴
├── js/admin.js           ← 관리자 페이지 동작
├── assets/                ← 로고·파비콘·OG 이미지
└── favicon.ico
```

---

## 1. 꼭 해야 할 설정 — 에어비앤비 예약 링크

`index.html` 위쪽의 `<body data-booking-url="">` 큰따옴표 안에 숙소 URL을 넣어주세요.

```html
<body data-booking-url="https://www.airbnb.co.kr/rooms/12345678">
```

이 한 곳만 채우면 페이지의 모든 예약 버튼에 자동으로 반영됩니다. 비워두면 상단·하단 예약 버튼은 예약 섹션으로 이동만 하고, 맨 아래 "에어비앤비에서 예약하기" 버튼만 비활성 상태로 표시됩니다.

## 2. ⚠️ 공개 전 반드시 — 사진 교체

지금 페이지의 사진은 **무료 스톡 사진(Unsplash)이며 실제 숙소가 아닙니다.** 게스트가 오해할 수 있으니 실제 촬영본으로 꼭 교체해주세요.

교체 방법은 두 가지입니다.

**방법 A — 사진 파일을 저장소에 넣기 (권장)**

1. 사진을 `assets/photos/` 폴더에 넣습니다 (예: `living.jpg`, `bed1.jpg`).
2. `index.html`에서 `https://images.unsplash.com/...`로 시작하는 주소를 파일 경로로 바꿉니다.

```html
<!-- 변경 전 -->
<img src="https://images.unsplash.com/photo-1680965075873-...&q=80" alt="거실" data-photo loading="lazy">

<!-- 변경 후 -->
<img src="assets/photos/living.jpg" alt="거실" data-photo loading="lazy">
```

**방법 B — 사진 주소만 교체**

이미 사진이 인터넷에 올라가 있다면 `src="..."` 값만 그 주소로 바꾸면 됩니다.

교체할 위치는 `index.html`에서 `data-photo`로 검색하면 모두 찾을 수 있습니다 (총 14곳: 히어로 1 · 소개 1 · 갤러리 5 · 위치 1 · 주변 정보 5 · 예약 1).

사진 비율은 CSS가 알아서 맞춰주므로(`object-fit: cover`) 어떤 크기를 넣어도 레이아웃이 깨지지 않습니다. 가로 1600px 내외, 1MB 이하를 권장합니다.

사진을 모두 교체한 뒤에는 갤러리 위의 안내 문구도 지워주세요 — `index.html`에서 "분위기 참고용 이미지" 로 검색하면 나오는 `<p class="sec-note">` 한 줄입니다.

> 사진 주소가 잘못되거나 인터넷이 느려 사진이 안 뜨더라도, 브랜드 색 그래픽이 대신 표시되도록 되어 있어 페이지가 깨져 보이지 않습니다.

## 3. 관리자 페이지 (admin.html)

코드를 직접 건드리지 않고 홈페이지 내용을 고칠 수 있는 편집 도구입니다. `admin.html`을 브라우저로 열면 됩니다.

**무엇을 고칠 수 있나요**

예약 링크, 모든 한국어·영어 문구(143개 항목), 사진 14곳의 주소와 설명, 가격, 주소, 지도 링크까지 페이지의 거의 모든 내용을 섹션별로 정리해 보여줍니다. 줄바꿈은 Enter로 입력하면 홈페이지에도 그대로 반영됩니다.

**저장하는 방법은 두 가지입니다**

- **index.html 내려받기** — 수정된 파일을 받아서 GitHub 저장소에 덮어쓰기 합니다. 아무 설정도 필요 없습니다.
- **GitHub에 바로 저장** — 저장소 이름과 액세스 토큰을 한 번 등록해두면, 버튼 한 번으로 홈페이지에 반영됩니다(1~2분 뒤 적용).

**GitHub 토큰 발급 방법**

1. GitHub → 우측 상단 프로필 → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. **Repository access**에서 `Only select repositories`를 고르고 이 홈페이지 저장소 **하나만** 선택
3. **Permissions → Repository permissions → Contents**를 `Read and write`로 설정
4. 만료일(Expiration)을 지정하고 생성한 뒤, 나온 토큰 문자열을 관리자 페이지의 "액세스 토큰" 칸에 붙여넣고 **설정 저장**

토큰은 그 저장소 하나에만 권한이 있고, 브라우저 안에만 저장되며 GitHub 외의 다른 곳으로 전송되지 않습니다. 공용 컴퓨터에서 쓰셨다면 **토큰 지우기**를 눌러주세요.

### ⚠️ 관리자 페이지 보안에 대해

**정적 웹사이트에는 진짜 로그인을 만들 수 없습니다.** 서버가 없어서 비밀번호를 확인해줄 곳이 없고, 페이지 안에 비밀번호를 적어두면 소스 보기로 그대로 드러납니다. 그래서 가짜 로그인 화면을 넣는 대신 이렇게 설계했습니다.

- 관리자 페이지 자체에는 비밀 정보가 없습니다. 누가 열더라도 **내 홈페이지를 바꿀 수는 없습니다** — 실제 변경에는 나만 가진 GitHub 토큰이 필요하기 때문입니다.
- 검색엔진에 노출되지 않도록 `noindex` 처리를 해두었습니다.
- **가장 안전한 방법은 `admin.html`과 `js/admin.js`를 GitHub에 올리지 않고, 내 컴퓨터에서만 파일을 직접 열어 쓰는 것입니다.** 이때는 자동으로 파일을 못 읽으므로 화면 안내에 따라 `index.html`을 선택(또는 끌어다 놓기)해주면 됩니다. 수정 후 "내려받기"로 받아 GitHub에 올리면 끝입니다.
- 웹에 올려서 쓰신다면 주소를 공유하지 마시고, 토큰에는 반드시 만료일을 설정해주세요.

> 미리보기 기능은 웹 주소(http)로 열었을 때 가장 정확하게 동작합니다.

## 4. 로컬에서 미리보기

`index.html`을 브라우저로 열면 바로 확인할 수 있습니다. (글꼴과 스톡 사진은 인터넷 연결이 있어야 정상적으로 보입니다.)

## 5. GitHub Pages로 무료 배포하기

1. [github.com](https://github.com)에서 로그인 후 **+ → New repository**로 저장소를 만듭니다. **Public**으로 설정하세요.
2. 이 폴더의 모든 파일을 저장소에 올립니다.
   - 웹에서: **Add file → Upload files**에 끌어다 놓고 **Commit changes**
   - 터미널에서:
     ```bash
     cd yeonhee-stay
     git init
     git add .
     git commit -m "연희 스테이 홈페이지"
     git branch -M main
     git remote add origin https://github.com/내계정/저장소이름.git
     git push -u origin main
     ```
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Source**를 `Deploy from a branch`, **Branch**를 `main` / `/(root)`로 지정하고 **Save**.
5. 1~2분 뒤 `https://내계정.github.io/저장소이름/` 주소가 표시됩니다.

이후 파일을 수정하고 다시 push(또는 재업로드)하면 몇 분 안에 자동 반영됩니다.

## 6. 나중에 실제 도메인 연결하기

가비아·후이즈 등에서 도메인을 구매한 뒤 **Settings → Pages → Custom domain**에 입력하고, 도메인 관리 화면에서 안내되는 CNAME/A 레코드를 등록하면 됩니다.

---

## 참고 — 디자인 메모

- 색: 로고에서 뽑은 크림(`#FBF1E8`)과 에스프레소(`#241A13`)를 축으로, 밝은 섹션과 어두운 섹션을 번갈아 배치했습니다.
- 글꼴: 제목은 Cormorant Garamond + 나눔명조, 본문은 Inter + 본고딕(Noto Sans KR)입니다.
- 한국어/영어는 같은 페이지 안에서 전환됩니다. 텍스트를 고칠 때는 `<span class="ko">`와 `<span class="en">` 두 곳을 함께 수정해주세요.
- 사진 라이선스: Unsplash License (상업적 사용 가능, 출처 표기 의무 없음). 어차피 실제 사진으로 교체할 예정이라면 신경 쓰지 않아도 됩니다.
