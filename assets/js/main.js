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
