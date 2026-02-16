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
