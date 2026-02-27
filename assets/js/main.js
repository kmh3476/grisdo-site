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
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------------------
  // ✅ (A) hero가 없는 페이지는 조용히 종료
  // -----------------------------------------
  const a = document.getElementById("heroBgA");
  const b = document.getElementById("heroBgB");
  const toggleBtn = document.getElementById("heroToggle");

  // hero 구조가 없는 페이지(about/notice/contact 등)에서는 아무 것도 안 함
  if (!a || !b) return;

  // -----------------------------------------
  // ✅ (B) 상태 저장 키 (먼저 선언!)
  // -----------------------------------------
  const STORAGE_KEY = "hero_userPaused"; // "1"=유저가 멈춤, "0"(또는 null)=재생 허용

  // -----------------------------------------
  // ✅ (C) 이미지 경로: 루트/상대 자동 보정
  //    - /assets/... 가 서브폴더 배포에서 깨질 수 있어서 방어
  // -----------------------------------------
  // 기본은 네가 원한 루트 경로 버전

  // 현재 페이지가 루트(/index.html)인지, 서브경로인지에 따라 선택
  // - 서브경로 배포(예: https://domain.com/church/index.html)면 상대경로가 더 안전함
  // - 루트 배포면 /assets가 잘 먹음
  const isSubPath = (() => {
    // pathname이 "/"나 "/index.html"이면 루트에 가깝다고 보고, 그 외는 서브경로 가능성
    const p = location.pathname || "/";
    if (p === "/" || p.endsWith("/index.html")) return false;
    // 예: "/church/index.html" "/church/" 같은 경우
    // 단, "/about.html" 같은 단일 파일도 루트에 있을 수 있으나,
    // 이건 assets 접근성 판단에 큰 문제는 없어서 상대경로가 더 안전하게 동작함
    return true;
  })();

  const images = ["assets/img/hero.jpg", "assets/img/hero2.jpg"];

  // -----------------------------------------
  // ✅ (D) 유저 멈춤 상태 로드
  // -----------------------------------------
  let userPaused = localStorage.getItem(STORAGE_KEY) === "1";

  // -----------------------------------------
  // ✅ (E) 프리로드 + 로드 실패 감지(검정만 뜨는 문제 디버그)
  // -----------------------------------------
  images.forEach((src) => {
    const img = new Image();
    img.onload = () => {
      // 필요하면 확인용 로그(원하면 살려도 됨)
      // console.log("[HERO] loaded:", src);
    };
    img.onerror = () => {
      console.warn("[HERO] 이미지 로드 실패:", src, " (경로/파일명/대소문자 확인)");
    };
    img.src = src;
  });

  // -----------------------------------------
  // ✅ (F) 상태 변수
  // -----------------------------------------
  let idx = 0;
  let showingA = true;
  const intervalMs = 6000;
  let timerId = null;

  // -----------------------------------------
  // ✅ (G) per-image class 적용 (CSS에서 background-position 다르게 쓰는 용도)
  // -----------------------------------------
  function applyPerImageClass(el, imgPath) {
    el.classList.remove("is-hero1", "is-hero2");
    if (imgPath.includes("hero2.jpg")) el.classList.add("is-hero2");
    else el.classList.add("is-hero1");
  }

  // -----------------------------------------
  // ✅ (H) 버튼 UI 업데이트 (라벨/aria-pressed)
  //    - 너 HTML은 SVG 아이콘이 들어있지만
  //      여기서는 라벨/aria만 확실히 맞춰줌
  //      (SVG 토글까지 원하면 추가 가능)
  // -----------------------------------------
  function setBtnUI(playing) {
    if (!toggleBtn) return;

    const labelEl = toggleBtn.querySelector(".heroCtrl__label");
    if (labelEl) labelEl.textContent = playing ? "일시정지" : "재생";

    // pressed는 "멈춤(true)"일 때 true
    toggleBtn.setAttribute("aria-pressed", playing ? "false" : "true");
  }

  // -----------------------------------------
  // ✅ (I) 초기 배경 세팅 (검정 화면 방지 핵심)
  // -----------------------------------------
  a.style.backgroundImage = `url("${images[0]}")`;
  b.style.backgroundImage = `url("${images[0]}")`;
  applyPerImageClass(a, images[0]);
  applyPerImageClass(b, images[0]);

  a.classList.add("is-active");
  b.classList.remove("is-active");

  // -----------------------------------------
  // ✅ (J) 다음 이미지로 페이드 전환
  // -----------------------------------------
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
    showingA = !showingA;
  }

  // -----------------------------------------
  // ✅ (K) 재생/정지
  // -----------------------------------------
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

  // -----------------------------------------
  // ✅ (L) 버튼 클릭 토글 + localStorage 저장
  // -----------------------------------------
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isPlayingNow = !!timerId;

      if (isPlayingNow) {
        // 재생 중 -> 유저가 멈춤
        userPaused = true;
        localStorage.setItem(STORAGE_KEY, "1");
        stop();
      } else {
        // 멈춤 중 -> 유저가 재생
        userPaused = false;
        localStorage.setItem(STORAGE_KEY, "0");
        start();
      }
    });
  }

  // -----------------------------------------
  // ✅ (M) 첫 진입 시: 저장 상태에 따라 시작/정지 결정
  // -----------------------------------------
  if (userPaused) stop();
  else start();

  // -----------------------------------------
  // ✅ (N) 탭 숨김/복귀: 유저가 멈춘 상태면 유지
  // -----------------------------------------
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // 숨겨지면 정지(성능/배터리)
      stop();
    } else {
      // 복귀 시 저장값 다시 읽고 그대로 반영
      userPaused = localStorage.getItem(STORAGE_KEY) === "1";
      if (userPaused) stop();
      else start();
    }
  });
});