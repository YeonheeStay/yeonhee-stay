/* 연희 스테이 · 관리자 페이지
   index.html 을 직접 읽어 편집하고, 수정된 파일을 내려받거나 GitHub 에 커밋합니다.
   서버가 없어도 동작하도록 모든 처리는 브라우저 안에서 이루어집니다. */
(function () {
  'use strict';

  var doc = null;            // 파싱된 index.html 문서
  var dirty = false;
  var LS_CFG = 'yeonhee-admin-gh';

  var $ = function (id) { return document.getElementById(id); };

  /* ---------------- 섹션 정의 ---------------- */
  var SECTIONS = [
    ['#top',        '히어로 (첫 화면)'],
    ['#story',      '소개'],
    ['.band',       '이런 점이 좋아요'],
    ['#gallery',    '공간 (갤러리)'],
    ['#amenities',  '편의시설'],
    ['#location',   '위치'],
    ['#guide',      '맛집 · 볼거리'],
    ['#book',       '예약'],
    ['.foot',       '푸터'],
    ['.dock',       '모바일 하단 예약바'],
    ['.nav',        '상단 메뉴'],
    ['.sheet',      '모바일 메뉴']
  ];
  var SINGLE_TEXT = ['.price-num', '.stat dd', '.dock-price strong'];

  /* ---------------- 알림 ---------------- */
  var toastTimer;
  function toast(msg, isErr) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.toggle('err', !!isErr);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }
  function setState(text, cls) {
    $('stateText').textContent = text;
    $('stateDot').className = 'dot ' + (cls || '');
  }
  function markDirty() {
    dirty = true;
    setState('저장 안 됨', 'warn');
  }

  /* ---------------- 불러오기 ---------------- */
  function boot(html) {
    doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc || !doc.querySelector('#book')) {
      showPicker('이 파일은 연희 스테이 홈페이지의 index.html 이 아닌 것 같습니다. 다시 선택해주세요.');
      return;
    }
    $('loader').hidden = true;
    $('app').hidden = false;
    buildForm();
    loadGhCfg();
    setState('불러옴', 'on');
  }

  function showPicker(msg) {
    $('loaderMsg').textContent = msg;
    $('drop').hidden = false;
  }

  fetch('index.html', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(boot)
    .catch(function () {
      showPicker('홈페이지 파일을 자동으로 읽지 못했습니다.');
    });

  $('filePick').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (f) readFile(f);
  });
  var drop = $('drop');
  ['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
  });
  drop.addEventListener('drop', function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) readFile(f);
  });
  function readFile(file) {
    var fr = new FileReader();
    fr.onload = function () { boot(String(fr.result)); };
    fr.onerror = function () { toast('파일을 읽지 못했습니다.', true); };
    fr.readAsText(file, 'utf-8');
  }

  /* ---------------- 폼 만들기 ---------------- */
  function sectionOf(el) {
    for (var i = 0; i < SECTIONS.length; i++) {
      if (el.closest(SECTIONS[i][0])) return SECTIONS[i];
    }
    return null;
  }
  function shorten(s, n) {
    s = (s || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n) + '…' : s;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function buildForm() {
    var buckets = {};
    SECTIONS.forEach(function (s) { buckets[s[1]] = []; });

    // 1) 한국어/영어 짝 텍스트
    Array.prototype.forEach.call(doc.querySelectorAll('span.ko'), function (ko) {
      var en = ko.nextElementSibling;
      if (!en || !en.classList.contains('en')) en = null;
      var sec = sectionOf(ko);
      if (!sec) return;
      buckets[sec[1]].push({ type: 'pair', ko: ko, en: en });
    });

    // 2) 단독 텍스트(가격, 숫자 등)
    SINGLE_TEXT.forEach(function (sel) {
      Array.prototype.forEach.call(doc.querySelectorAll(sel), function (node) {
        var sec = sectionOf(node);
        if (!sec) return;
        buckets[sec[1]].push({ type: 'single', node: node });
      });
    });

    // 3) 사진
    Array.prototype.forEach.call(doc.querySelectorAll('img[data-photo]'), function (img) {
      var sec = sectionOf(img);
      if (!sec) return;
      buckets[sec[1]].push({ type: 'photo', node: img });
    });

    // 4) 지도 링크
    Array.prototype.forEach.call(doc.querySelectorAll('a.link-arrow[href]'), function (a) {
      var sec = sectionOf(a);
      if (!sec) return;
      buckets[sec[1]].push({ type: 'href', node: a, label: '지도 링크 주소' });
    });

    // 예약 링크
    var urlInput = $('bookingUrl');
    urlInput.value = doc.body.getAttribute('data-booking-url') || '';
    urlInput.addEventListener('input', function () {
      doc.body.setAttribute('data-booking-url', urlInput.value.trim());
      markDirty();
    });

    var host = $('sections');
    var nav = $('sideNav');
    host.innerHTML = '';
    nav.innerHTML = '';

    SECTIONS.forEach(function (s) {
      var label = s[1];
      var items = buckets[label];
      if (!items.length) return;

      var id = 'sec-' + label.replace(/[^가-힣A-Za-z0-9]/g, '');
      var panel = el('section', 'panel');
      panel.id = id;
      panel.appendChild(el('h2', null, label));

      // 문서 순서대로 정렬
      items.sort(function (a, b) {
        var na = a.ko || a.node, nb = b.ko || b.node;
        var pos = na.compareDocumentPosition(nb);
        return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
      });

      items.forEach(function (item) { panel.appendChild(buildField(item)); });
      host.appendChild(panel);

      var link = el('a', null, label);
      link.href = '#' + id;
      var c = el('span', 'count', String(items.length));
      link.appendChild(c);
      nav.appendChild(link);
    });
  }

  /* 줄바꿈(<br>)을 유지한 채 읽고 쓰기 */
  function readText(node) {
    var out = '';
    for (var i = 0; i < node.childNodes.length; i++) {
      var c = node.childNodes[i];
      if (c.nodeType === 3) out += c.data;
      else if (c.nodeName === 'BR') out += '\n';
      else out += c.textContent;
    }
    return out;
  }
  function writeText(node, val) {
    while (node.firstChild) node.removeChild(node.firstChild);
    var d = node.ownerDocument;
    var lines = String(val).split('\n');
    for (var i = 0; i < lines.length; i++) {
      if (i) node.appendChild(d.createElement('br'));
      node.appendChild(d.createTextNode(lines[i]));
    }
  }

  function textControl(node) {
    var v = readText(node);
    var multi = v.length > 34 || v.indexOf('\n') >= 0;
    var c = document.createElement(multi ? 'textarea' : 'input');
    if (c.tagName === 'INPUT') c.type = 'text';
    c.value = v;
    c.addEventListener('input', function () { writeText(node, c.value); markDirty(); });
    return c;
  }

  function buildField(item) {
    var wrap = el('div', 'field');

    if (item.type === 'pair') {
      wrap.appendChild(el('span', 'flabel', shorten(readText(item.ko), 52)));
      var pair = el('div', 'pair');

      var kbox = el('div');
      var ksub = el('div', 'sub');
      ksub.appendChild(el('span', 'chip', 'KO'));
      kbox.appendChild(ksub);
      kbox.appendChild(textControl(item.ko));
      pair.appendChild(kbox);

      if (item.en) {
        var ebox = el('div');
        var esub = el('div', 'sub');
        esub.appendChild(el('span', 'chip', 'EN'));
        ebox.appendChild(esub);
        ebox.appendChild(textControl(item.en));
        pair.appendChild(ebox);
      }
      wrap.appendChild(pair);
      return wrap;
    }

    if (item.type === 'single') {
      wrap.appendChild(el('span', 'flabel', shorten(readText(item.node), 52) + ' (공통)'));
      wrap.appendChild(textControl(item.node));
      return wrap;
    }

    if (item.type === 'href') {
      wrap.appendChild(el('span', 'flabel', item.label));
      var hi = el('input');
      hi.type = 'url'; hi.className = 'mono'; hi.value = item.node.getAttribute('href') || '';
      hi.addEventListener('input', function () { item.node.setAttribute('href', hi.value.trim()); markDirty(); });
      wrap.appendChild(hi);
      return wrap;
    }

    // photo
    wrap.appendChild(el('span', 'flabel', '사진 — ' + (item.node.getAttribute('alt') || '')));
    var ph = el('div', 'photo');
    var thumb = el('div', 'photo-thumb');
    var timg = el('img');
    timg.alt = '';
    timg.src = item.node.getAttribute('src') || '';
    timg.addEventListener('error', function () {
      thumb.innerHTML = '';
      thumb.appendChild(el('span', null, '미리보기 없음'));
    });
    thumb.appendChild(timg);

    var right = el('div');
    var pi = el('input');
    pi.type = 'text'; pi.className = 'mono';
    pi.value = item.node.getAttribute('src') || '';
    pi.placeholder = 'assets/photos/living.jpg';
    pi.addEventListener('input', function () {
      var v = pi.value.trim();
      item.node.setAttribute('src', v);
      thumb.innerHTML = '';
      var n = el('img'); n.src = v; n.alt = '';
      n.addEventListener('error', function () {
        thumb.innerHTML = '';
        thumb.appendChild(el('span', null, '미리보기 없음'));
      });
      thumb.appendChild(n);
      markDirty();
    });
    var alt = el('input');
    alt.type = 'text';
    alt.value = item.node.getAttribute('alt') || '';
    alt.placeholder = '사진 설명 (검색·접근성용)';
    alt.style.marginTop = '8px';
    alt.addEventListener('input', function () { item.node.setAttribute('alt', alt.value); markDirty(); });

    right.appendChild(pi);
    right.appendChild(alt);
    ph.appendChild(thumb);
    ph.appendChild(right);
    wrap.appendChild(ph);
    return wrap;
  }

  /* ---------------- 결과 HTML ---------------- */
  function serialize() {
    return '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
  }

  $('downloadBtn').addEventListener('click', function () {
    var blob = new Blob([serialize()], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
    dirty = false;
    setState('내려받음', 'on');
    toast('index.html 을 내려받았습니다. GitHub 저장소에 덮어써 주세요.');
  });

  $('previewBtn').addEventListener('click', function () {
    var clone = doc.cloneNode(true);
    var base = clone.createElement('base');
    base.href = location.href.replace(/[^/]*$/, '');
    clone.head.insertBefore(base, clone.head.firstChild);
    var html = '<!doctype html>\n' + clone.documentElement.outerHTML;
    var url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    var w = window.open(url, '_blank');
    if (!w) toast('팝업이 차단되었습니다. 팝업을 허용해주세요.', true);
    setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
  });

  /* ---------------- GitHub 저장 ---------------- */
  function ghCfg() {
    return {
      repo: $('ghRepo').value.trim(),
      branch: $('ghBranch').value.trim() || 'main',
      path: $('ghPath').value.trim() || 'index.html',
      token: $('ghToken').value.trim()
    };
  }
  function refreshGh() {
    var c = ghCfg();
    var ready = !!(c.repo && c.token && /^[^/]+\/[^/]+$/.test(c.repo));
    $('ghSaveBtn').disabled = !ready;
    $('ghDot').className = 'dot ' + (ready ? 'on' : '');
    $('ghText').textContent = ready ? c.repo + ' · ' + c.branch : '미설정';
  }
  ['ghRepo', 'ghBranch', 'ghPath', 'ghToken'].forEach(function (id) {
    $(id).addEventListener('input', refreshGh);
  });

  function loadGhCfg() {
    var raw = null;
    try { raw = localStorage.getItem(LS_CFG); } catch (e) {}
    if (raw) {
      try {
        var c = JSON.parse(raw);
        $('ghRepo').value = c.repo || '';
        $('ghBranch').value = c.branch || 'main';
        $('ghPath').value = c.path || 'index.html';
        $('ghToken').value = c.token || '';
      } catch (e) {}
    }
    refreshGh();
  }

  $('ghSaveCfg').addEventListener('click', function () {
    try {
      localStorage.setItem(LS_CFG, JSON.stringify(ghCfg()));
      toast('설정을 이 브라우저에 저장했습니다.');
    } catch (e) { toast('설정을 저장하지 못했습니다.', true); }
    refreshGh();
  });

  $('ghClear').addEventListener('click', function () {
    try { localStorage.removeItem(LS_CFG); } catch (e) {}
    $('ghToken').value = '';
    refreshGh();
    toast('토큰을 지웠습니다.');
  });

  function b64utf8(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    var CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    }
    return btoa(bin);
  }

  $('ghSaveBtn').addEventListener('click', function () {
    var c = ghCfg();
    var btn = $('ghSaveBtn');
    var api = 'https://api.github.com/repos/' + c.repo + '/contents/' + c.path.replace(/^\/+/, '');
    var head = {
      'Authorization': 'Bearer ' + c.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    btn.disabled = true;
    setState('저장 중…', 'warn');

    fetch(api + '?ref=' + encodeURIComponent(c.branch), { headers: head })
      .then(function (r) {
        if (r.status === 404) return null;          // 새 파일
        if (!r.ok) throw new Error('현재 파일 정보를 불러오지 못했습니다 (' + r.status + ')');
        return r.json();
      })
      .then(function (cur) {
        var body = {
          message: '홈페이지 내용 수정 (관리자 페이지)',
          content: b64utf8(serialize()),
          branch: c.branch
        };
        if (cur && cur.sha) body.sha = cur.sha;
        return fetch(api, { method: 'PUT', headers: head, body: JSON.stringify(body) });
      })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error(j.message || ('저장 실패 (' + r.status + ')'));
          return j;
        });
      })
      .then(function () {
        dirty = false;
        setState('GitHub에 저장됨', 'on');
        toast('저장했습니다. 홈페이지에는 1~2분 뒤 반영됩니다.');
      })
      .catch(function (err) {
        setState('저장 실패', 'err');
        toast(err.message || '저장에 실패했습니다.', true);
      })
      .then(function () { refreshGh(); });
  });

  /* ---------------- 저장 안 한 변경 경고 ---------------- */
  window.addEventListener('beforeunload', function (e) {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = '';
  });
})();
