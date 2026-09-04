/* 연희 스테이 · Yeonhee Stay */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ------------------------------------------------------------------
     1. 예약 링크
     index.html 의 <body data-booking-url="..."> 값 하나만 채우면
     페이지의 모든 예약 버튼에 자동으로 반영됩니다.
  ------------------------------------------------------------------ */
  var bookingUrl = (document.body.getAttribute('data-booking-url') || '').trim();
  Array.prototype.forEach.call(document.querySelectorAll('[data-book]'), function (a) {
    if (bookingUrl) {
      a.href = bookingUrl;
      a.target = '_blank';
      a.rel = 'noopener';
    } else if (a.hasAttribute('data-book-primary')) {
      // 링크가 아직 없을 때는 마지막 예약 버튼만 비활성 상태로 표시하고,
      // 나머지 버튼은 그대로 예약 섹션으로 이동합니다.
      a.classList.add('is-off');
      a.removeAttribute('href');
      a.setAttribute('aria-disabled', 'true');
      a.title = '예약 링크가 아직 등록되지 않았습니다 / Booking link not set yet';
    }
  });

  /* ------------------------------------------------------------------
     2. 사진 로드 실패 시 브랜드 그래픽으로 대체
  ------------------------------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll('img[data-photo]'), function (img) {
    var fail = function () { img.style.display = 'none'; };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* ------------------------------------------------------------------
     3. 언어 전환
  ------------------------------------------------------------------ */
  var LANG_KEY = 'yeonhee-stay-lang';
  function applyLang(lang) {
    if (lang === 'en') { root.classList.add('lang-en'); root.setAttribute('lang', 'en'); }
    else { root.classList.remove('lang-en'); root.setAttribute('lang', 'ko'); }
  }
  try { if (localStorage.getItem(LANG_KEY) === 'en') applyLang('en'); } catch (e) {}

  var langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      var next = root.classList.contains('lang-en') ? 'ko' : 'en';
      applyLang(next);
      try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
    });
  }

  /* ------------------------------------------------------------------
     4. 스크롤에 따른 헤더 / 하단 예약바
  ------------------------------------------------------------------ */
  var nav = document.getElementById('nav');
  var dock = document.getElementById('dock');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('solid', y > window.innerHeight * 0.72);
    if (dock) dock.classList.toggle('is-down', y < 260);
    ticking = false;
  }
  function requestScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  onScroll();

  /* ------------------------------------------------------------------
     5. 모바일 메뉴
  ------------------------------------------------------------------ */
  var burger = document.getElementById('burger');
  var sheet = document.getElementById('sheet');
  var sheetClose = document.getElementById('sheetClose');

  function openSheet() {
    if (!sheet) return;
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    if (burger) burger.setAttribute('aria-expanded', 'true');
  }
  function closeSheet() {
    if (!sheet) return;
    sheet.hidden = true;
    document.body.style.overflow = '';
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  if (burger) burger.addEventListener('click', openSheet);
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);
  if (sheet) {
    Array.prototype.forEach.call(sheet.querySelectorAll('a'), function (a) {
      a.addEventListener('click', closeSheet);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet && !sheet.hidden) closeSheet();
  });

  /* ------------------------------------------------------------------
     6. 스크롤 등장 효과

     화면 아래쪽에 있는 요소에만 .pre 를 붙여 숨겨두고, 스크롤 위치를 기준으로
     화면에 들어오는 순간 떼어냅니다. IntersectionObserver 처럼 환경에 따라
     동작하지 않을 수 있는 기능에 의존하지 않으므로, 콘텐츠가 보이지 않는
     상태로 남는 일이 없습니다.
  ------------------------------------------------------------------ */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-anim]'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (items.length && !reduceMotion) {
    var LINE = 0.92;                     // 화면 높이의 92% 지점을 넘어오면 표시
    var pending = [];

    items.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight * LINE) {
        el.classList.add('pre');
        pending.push(el);
      }
    });

    // 같은 부모 안에서는 살짝 시차를 둡니다.
    pending.forEach(function (el) {
      var parent = el.parentNode;
      if (!parent || !parent.children) return;
      var idx = 0;
      for (var i = 0; i < parent.children.length; i++) {
        var sib = parent.children[i];
        if (sib === el) break;
        if (sib.hasAttribute && sib.hasAttribute('data-anim')) idx++;
      }
      if (idx > 0) el.style.transitionDelay = Math.min(idx, 5) * 90 + 'ms';
    });

    var sweeping = false;
    function sweep() {
      sweeping = false;
      if (!pending.length) return;
      var line = window.innerHeight * LINE;
      var rest = [];
      for (var i = 0; i < pending.length; i++) {
        if (pending[i].getBoundingClientRect().top < line) pending[i].classList.remove('pre');
        else rest.push(pending[i]);
      }
      pending = rest;
    }
    function queueSweep() {
      if (sweeping) return;
      sweeping = true;
      window.requestAnimationFrame(sweep);
    }

    window.addEventListener('scroll', queueSweep, { passive: true });
    window.addEventListener('resize', queueSweep);
    window.addEventListener('load', queueSweep);
    window.addEventListener('hashchange', queueSweep);
    document.addEventListener('visibilitychange', queueSweep);
    // 글꼴·이미지 로딩으로 위치가 바뀌는 경우까지 커버
    [120, 600, 1600, 3200].forEach(function (t) { window.setTimeout(sweep, t); });
  }
})();
