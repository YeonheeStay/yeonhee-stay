// 연희스테이 — static site behaviour: nav shrink, mobile menu, scroll reveal.
(function () {
  var nav = document.getElementById('siteNav');
  var onScroll = function () {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.getElementById('navBurger');
  var mobileMenu = document.getElementById('mobileMenu');
  var closeMobile = function () { mobileMenu.classList.remove('open'); };
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () { mobileMenu.classList.toggle('open'); });
    mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMobile); });
  }

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
})();
