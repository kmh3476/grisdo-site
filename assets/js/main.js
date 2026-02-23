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
          io.disconnect(); // 한 번만 등장하고 끝
        }
      });
    },
    {
      threshold: 0.25,          // 25% 정도 보이면 트리거
      rootMargin: "0px 0px -10% 0px" // 살짝 일찍/자연스럽게
    }
  );

  io.observe(worshipSection);
});

// ✅ 스크롤 시 헤더 색상 전환
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");

  if (window.scrollY > 380) {   // 200px 내려가면 변경
    header.classList.add("is-scrolled");
  } else {
    header.classList.remove("is-scrolled");
  }
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

// ===== HERO Crossfade Slider (페이드) =====
document.addEventListener("DOMContentLoaded", () => {
  const images = [
    "assets/img/hero.jpg",
    "assets/img/hero2.jpg",
  ];

  const a = document.getElementById("heroBgA");
  const b = document.getElementById("heroBgB");

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

  // ✅ 두 레이어 모두 초기 이미지로 채움 (중요!)
  a.style.backgroundImage = `url("${images[0]}")`;
  b.style.backgroundImage = `url("${images[0]}")`;
  a.classList.add("is-active");
  b.classList.remove("is-active");

  function applyPerImageClass(el, imgPath) {
  el.classList.remove("is-hero1", "is-hero2");

  if (imgPath.includes("hero.jpg")) {
    el.classList.add("is-hero1");
  }

  if (imgPath.includes("hero2.jpg")) {
    el.classList.add("is-hero2");
  }
}

  // 초기 이미지 클래스도 맞춰줌(선택)
  applyPerImageClass(a, images[0]);
  applyPerImageClass(b, images[0]);

  function next() {
    const nextIdx = (idx + 1) % images.length;
    const nextSrc = images[nextIdx];

    const incoming = showingA ? b : a;
    const outgoing = showingA ? a : b;

    // ✅ 먼저 이미지/클래스 세팅
    incoming.style.backgroundImage = `url("${nextSrc}")`;
    applyPerImageClass(incoming, nextSrc);

    // ✅ 페이드
    incoming.classList.add("is-active");
    outgoing.classList.remove("is-active");

    idx = nextIdx;
    showingA = !showingA;
  }

  setInterval(next, 6000);
});