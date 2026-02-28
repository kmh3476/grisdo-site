// =====================================================
// 1) ✅ 예배 안내 영역 도달 시 환영 문구 등장
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const welcome = document.querySelector("#welcome");
  const worshipSection = document.querySelector(".worship-link");

  if (!welcome || !worshipSection) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          welcome.classList.add("is-visible");
          io.disconnect();
        }
      });
    },
    {
      threshold: 0.25,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  io.observe(worshipSection);
});


// =====================================================
// 2) ✅ 스크롤 시 헤더 색상 전환
// =====================================================
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (!header) return;

  if (window.scrollY > 380) header.classList.add("is-scrolled");
  else header.classList.remove("is-scrolled");
});


// =====================================================
// 3) ✅ 모바일 햄버거 메뉴 토글
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const btn = document.querySelector(".navToggle");
  const mobileNav = document.querySelector(".navMobile");

  if (!header || !btn || !mobileNav) return;

  const closeMenu = () => {
    header.classList.remove("is-menu-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "메뉴 열기");
  };

  const openMenu = () => {
    header.classList.add("is-menu-open");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "메뉴 닫기");
  };

  btn.addEventListener("click", () => {
    const isOpen = header.classList.contains("is-menu-open");
    isOpen ? closeMenu() : openMenu();
  });

  // ✅ 메뉴 클릭 시 자동 닫힘
  mobileNav.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

  // ✅ 바깥 클릭 시 닫힘
  document.addEventListener("click", (e) => {
    if (!header.classList.contains("is-menu-open")) return;
    if (e.target.closest(".header")) return;
    closeMenu();
  });

  // ✅ 화면이 다시 커지면(데스크탑) 메뉴 상태 정리
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });
});


// =====================================================
// 4) ✅ HERO Crossfade Slider (2-layer fade) + 재생/일시정지
//    + 다른 페이지 이동해도 상태 유지(localStorage)
//    + ✅ "어느 사진에서 멈췄는지"까지 유지(localStorage)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const a = document.getElementById("heroBgA");
  const b = document.getElementById("heroBgB");
  const toggleBtn = document.getElementById("heroToggle");

  // hero 없는 페이지는 조용히 종료
  if (!a || !b) return;

  // ✅ 저장 키들
  const STORAGE_PAUSED = "hero_userPaused";   // "1"=유저가 멈춤
  const STORAGE_IDX = "hero_idx";             // "0","1"... 현재 이미지 인덱스
  // (원하면) 레이어 상태도 저장 가능하지만, idx만 저장해도 UX는 충분히 동일하게 느껴짐

  const isSubPath = (() => {
    const p = location.pathname || "/";
    if (p === "/" || p.endsWith("/index.html")) return false;
    return true;
  })();

  const images = ["assets/img/hero.jpg", "assets/img/hero2.jpg"];

  // ✅ 유저가 멈춤 상태인지
  let userPaused = localStorage.getItem(STORAGE_PAUSED) === "1";

  // ✅ 마지막으로 보고 있던 이미지 idx 불러오기 (없으면 0)
  const savedIdxRaw = localStorage.getItem(STORAGE_IDX);
  let idx = Number.isFinite(Number(savedIdxRaw)) ? Number(savedIdxRaw) : 0;

  // 혹시 이상한 값 들어있으면 안전하게 보정
  if (idx < 0 || idx >= images.length) idx = 0;

  // ✅ 레이어 토글 상태
  let showingA = true;

  // ✅ 프리로드 + 실패 감지(검정만 뜨는거 디버깅용)
  images.forEach((src) => {
    const img = new Image();
    img.onerror = () => console.warn("[HERO] 이미지 로드 실패:", src, "(경로/파일명/대소문자 확인)");
    img.src = src;
  });

  const intervalMs = 6000;
  let timerId = null;

  function applyPerImageClass(el, imgPath) {
    el.classList.remove("is-hero1", "is-hero2");
    if (imgPath.includes("hero2.jpg")) el.classList.add("is-hero2");
    else el.classList.add("is-hero1");
  }

  function setBtnUI(playing) {
    if (!toggleBtn) return;

    const labelEl = toggleBtn.querySelector(".heroCtrl__label");
    if (labelEl) labelEl.textContent = playing ? "일시정지" : "재생";

    toggleBtn.setAttribute("aria-pressed", playing ? "false" : "true");
  }

  // ✅ 현재 idx를 storage에 저장하는 함수
  function saveIdx() {
    localStorage.setItem(STORAGE_IDX, String(idx));
  }

  // ✅ (핵심) "저장된 idx"로 처음부터 배경을 세팅
  function initToIdx(initialIdx) {
    const src = images[initialIdx];

    // 두 레이어 모두 같은 이미지로 깔아두면 "검정 화면"이나 깜빡임이 줄어듦
    a.style.backgroundImage = `url("${src}")`;
    b.style.backgroundImage = `url("${src}")`;
    applyPerImageClass(a, src);
    applyPerImageClass(b, src);

    // A를 활성로 시작
    a.classList.add("is-active");
    b.classList.remove("is-active");
    showingA = true;

    idx = initialIdx;
    saveIdx();
  }

  // ✅ 다음 이미지로 전환
  function next() {
    const nextIdx = (idx + 1) % images.length;
    const nextSrc = images[nextIdx];

    const incoming = showingA ? b : a;
    const outgoing = showingA ? a : b;

    incoming.style.backgroundImage = `url("${nextSrc}")`;
    applyPerImageClass(incoming, nextSrc);

    incoming.classList.add("is-active");
    outgoing.classList.remove("is-active");

    idx = nextIdx;
    saveIdx();              // ✅ 전환될 때마다 저장
    showingA = !showingA;
  }

  function start() {
    if (timerId) return;
    timerId = setInterval(next, intervalMs);
    setBtnUI(true);
  }

  function stop() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    setBtnUI(false);
  }

  // ✅ 버튼 클릭 토글
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isPlayingNow = !!timerId;

      if (isPlayingNow) {
        // 재생 중 -> 멈춤
        userPaused = true;
        localStorage.setItem(STORAGE_PAUSED, "1");
        stop();
      } else {
        // 멈춤 -> 재생
        userPaused = false;
        localStorage.setItem(STORAGE_PAUSED, "0");
        start();
      }
    });
  }

  // ✅ 페이지를 떠나기 직전에 idx 저장(혹시라도 안전장치)
  window.addEventListener("pagehide", saveIdx);
  window.addEventListener("beforeunload", saveIdx);

  // ✅ 초기 세팅: "저장된 idx"로 시작
  initToIdx(idx);

  // ✅ 처음 진입 시: 유저가 멈춰둔 상태면 그대로 멈춤, 아니면 자동 재생
  if (userPaused) stop();
  else start();

  // ✅ 탭 숨김/복귀 처리: 유저가 멈춘 상태면 유지
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
      return;
    }

    // 복귀 시 최신 저장값 다시 읽어서 반영
    userPaused = localStorage.getItem(STORAGE_PAUSED) === "1";

    const saved = localStorage.getItem(STORAGE_IDX);
    let resumeIdx = Number.isFinite(Number(saved)) ? Number(saved) : 0;
    if (resumeIdx < 0 || resumeIdx >= images.length) resumeIdx = 0;

    // ✅ 혹시 다른 탭/페이지에서 idx가 바뀌었으면 그 idx로 즉시 맞춰줌
    initToIdx(resumeIdx);

    if (userPaused) stop();
    else start();
  });
});