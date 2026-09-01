# 연희스테이

연희동 골목 안, 이층 벽돌집 — 연희스테이 홈페이지 정적 사이트입니다.

## 구성

```
index.html          페이지 전체
assets/style.css     스타일
assets/main.js       스크롤 리빌·모바일 메뉴 동작
assets/logo.png      브랜드 로고
```

외부 API나 서버가 필요 없는 순수 정적 사이트입니다. 로컬에서는 `index.html`을 브라우저로 열면 바로 확인할 수 있습니다.

## GitHub Pages로 무료 배포하기

1. GitHub에서 새 저장소를 만듭니다 (예: `yeonhee-stay`).
2. 이 폴더(`index.html`, `assets/`, `README.md`)의 내용을 그 저장소에 push 합니다.
   ```
   git remote add origin https://github.com/<내계정>/yeonhee-stay.git
   git branch -M main
   git push -u origin main
   ```
3. 저장소 **Settings → Pages**로 이동해 Source를 `main` 브랜치 / `/ (root)`로 설정하고 저장합니다.
4. 잠시 후 `https://<내계정>.github.io/yeonhee-stay/` 주소로 접속하면 사이트가 공개됩니다. 무료이며, 링크가 있는 누구나 접속할 수 있습니다.
5. 나만의 도메인이 있다면 Settings → Pages → Custom domain에 입력해 연결할 수도 있습니다.

## 콘텐츠 수정하기

이 버전은 정적 파일이라 브라우저에서 바로 편집하는 관리자 화면은 없습니다. 사진·문구·가격을 바꾸려면:

- 문구/가격/후기 등 텍스트 → `index.html`에서 해당 부분을 직접 수정
- 색상/여백/타이포 → `assets/style.css`
- 사진 → `assets/` 폴더에 이미지 파일을 추가한 뒤, `index.html`의 해당 `.scene` 블록을
  `<img src="assets/파일명.jpg" alt="...">` 형태로 바꿔 넣으면 됩니다.

수정 후 다시 `git add . && git commit -m "update" && git push`만 하면 GitHub Pages가 자동으로 갱신됩니다.
