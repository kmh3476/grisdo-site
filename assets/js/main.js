// ✅ 예배 안내 영역 도달 시 환영 문구 등장
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
      rootMargin: "0px 0px -10% 0px"
    }
  );

  io.observe(worshipSection);
});

// ✅ 스크롤 시 헤더 색상 전환
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (!header) return;

  if (window.scrollY > 380) header.classList.add("is-scrolled");
  else header.classList.remove("is-scrolled");
});

// ✅ 모바일 햄버거 메뉴 토글
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

  mobileNav.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!header.classList.contains("is-menu-open")) return;
    if (e.target.closest(".header")) return;
    closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });
});

// ===== HERO Crossfade Slider (페이드) + 재생/일시정지 =====
document.addEventListener("DOMContentLoaded", () => {
  const images = [
    "assets/img/hero.jpg",
    "assets/img/hero2.jpg",
  ];

  const a = document.getElementById("heroBgA");
  const b = document.getElementById("heroBgB");
  const toggleBtn = document.getElementById("heroToggle");

  if (!a || !b) {
    console.warn("heroBgA/heroBgB 요소 없음. index.html hero 구조 확인!");
    return;
  }

  // ✅ 프리로드(깜빡임 방지)
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  let idx = 0;
  let showingA = true;

  const intervalMs = 6000;
  let timerId = null;

  // ✅ 유저가 '직접' 멈췄는지 기억 (탭 전환해도 유지)
  let userPaused = localStorage.getItem(STORAGE_KEY) === "1";
  const STORAGE_KEY = "hero_userPaused"; // ✅ 상태 저장 키

  function applyPerImageClass(el, imgPath) {
    el.classList.remove("is-hero1", "is-hero2");
    if (imgPath.includes("hero2.jpg")) el.classList.add("is-hero2");
    else el.classList.add("is-hero1");
  }

  function setBtnUI(playing) {
    if (!toggleBtn) return;

    const labelEl = toggleBtn.querySelector(".heroCtrl__label");

    // 요소 없으면 조용히 스킵(에러 방지)
    if (labelEl) labelEl.textContent = playing ? "일시정지" : "재생";

    // pressed는 "멈춤(true)"일 때 true로 두는게 자연스러움
    toggleBtn.setAttribute("aria-pressed", playing ? "false" : "true");
  }

  // ✅ 두 레이어 모두 초기 이미지로 채움
  a.style.backgroundImage = `url("${images[0]}")`;
  b.style.backgroundImage = `url("${images[0]}")`;
  applyPerImageClass(a, images[0]);
  applyPerImageClass(b, images[0]);

  a.classList.add("is-active");
  b.classList.remove("is-active");

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

  function start() {
    if (timerId) return;
    timerId = setInterval(next, intervalMs);
    setBtnUI(true);
  }

  function stop() {
    if (!timerId) {
      setBtnUI(false);
      return;
    }
    clearInterval(timerId);
    timerId = null;
    setBtnUI(false);
  }

  // ✅ 버튼 토글
  if (toggleBtn) {
    // (중요) 모바일에서 눌렀을 때 포커스 남는게 싫으면:
    // toggleBtn.addEventListener("mousedown", (e) => e.preventDefault());

    toggleBtn.addEventListener("click", () => {
      const isPlayingNow = !!timerId;
      if (isPlayingNow) {
        userPaused = true;
        localStorage.setItem(STORAGE_KEY, "1");   // ✅ 저장(멈춤)
        stop();
      } else {
        userPaused = false;
        localStorage.setItem(STORAGE_KEY, "1");   // ✅ 저장(멈춤)
        
        if (userPaused) stop();
        else start();

      }
    });
  }

  // ✅ 처음 자동 재생
  start();

  // ✅ 탭 숨김/복귀 처리: 유저가 멈춘 상태면 유지
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // 숨겨지면 타이머 정지(배터리/성능)
      stop();
    } else {
      // 유저가 멈춘게 아니면 재개
      if (!userPaused) start();
      else stop();
    }
  });
});