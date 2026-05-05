const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const hero = document.querySelector("#hero");
const heroBgImage = document.querySelector(".hero-bg");
const heroOverlay = document.querySelector(".hero-overlay");
const heroVideos = Array.from(document.querySelectorAll(".hero-video"));
const HERO_VIDEO_FADE_MS = 1000;

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", function handleMenuToggle() {
    const isOpen = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "X" : "☰";
  });
}

window.addEventListener(
  "scroll",
  () => {
    if (!nav) {
      return;
    }

    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  },
  { passive: true }
);

const fadeTargets = document.querySelectorAll(".fade-in, .stagger-item");
if (fadeTargets.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  fadeTargets.forEach((item, index) => {
    if (item.classList.contains("stagger-item")) {
      item.style.transitionDelay = `${index * 0.08}s`;
    }
    observer.observe(item);
  });
}

let ticking = false;
const onParallaxScroll = () => {
  if (!hero || !heroBgImage || !heroOverlay) {
    return;
  }

  const heroRect = hero.getBoundingClientRect();
  const heroHeight = hero.offsetHeight || 1;
  const progress = Math.min(Math.max(-heroRect.top / heroHeight, 0), 1);
  const translateY = progress * 120;
  const scale = 1 + progress * 0.12;
  const overlayOpacity = 0.45 + progress * 0.35;

  heroBgImage.style.setProperty("--hero-y", `${translateY}px`);
  heroBgImage.style.setProperty("--hero-scale", scale.toFixed(3));
  heroOverlay.style.setProperty("--hero-overlay-opacity", overlayOpacity.toFixed(3));
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onParallaxScroll();
        ticking = false;
      });
      ticking = true;
    }
  },
  { passive: true }
);

onParallaxScroll();

if (heroVideos.length > 0) {
  let currentHeroVideoIndex = 0;
  let heroVideoAdvanceTimer = null;
  let heroVideoFadeTimer = null;
  let heroVideoTransitioning = false;

  const playHeroVideo = (video) => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const scheduleHeroVideoAdvance = () => {
    if (heroVideos.length <= 1) {
      return;
    }

    const currentVideo = heroVideos[currentHeroVideoIndex];
    const duration = Number.isFinite(currentVideo.duration) ? currentVideo.duration : 0;
    if (!duration) {
      currentVideo.addEventListener("loadedmetadata", scheduleHeroVideoAdvance, { once: true });
      return;
    }

    window.clearTimeout(heroVideoAdvanceTimer);
    const remainingMs = Math.max((duration - currentVideo.currentTime) * 1000 - HERO_VIDEO_FADE_MS, 400);
    heroVideoAdvanceTimer = window.setTimeout(() => {
      advanceHeroVideo();
    }, remainingMs);
  };

  const advanceHeroVideo = () => {
    if (heroVideos.length <= 1 || heroVideoTransitioning) {
      return;
    }

    const currentVideo = heroVideos[currentHeroVideoIndex];
    const nextIndex = (currentHeroVideoIndex + 1) % heroVideos.length;
    const nextVideo = heroVideos[nextIndex];
    heroVideoTransitioning = true;

    const beginCrossfade = () => {
      window.clearTimeout(heroVideoAdvanceTimer);
      window.clearTimeout(heroVideoFadeTimer);

      nextVideo.currentTime = 0;
      nextVideo.classList.add("hero-video--active");
      playHeroVideo(nextVideo);

      heroVideoFadeTimer = window.setTimeout(() => {
        currentVideo.classList.remove("hero-video--active");
        currentVideo.pause();
        currentVideo.currentTime = 0;
        currentHeroVideoIndex = nextIndex;
        heroVideoTransitioning = false;
        scheduleHeroVideoAdvance();
      }, HERO_VIDEO_FADE_MS);
    };

    if (nextVideo.readyState < 2) {
      nextVideo.addEventListener("loadeddata", beginCrossfade, { once: true });
      nextVideo.load();
      return;
    }

    beginCrossfade();
  };

  heroVideos.forEach((video, index) => {
    video.loop = false;
    video.muted = true;
    video.preload = "auto";
    if (index !== currentHeroVideoIndex) {
      video.pause();
    }

    video.addEventListener("ended", () => {
      if (index === currentHeroVideoIndex) {
        advanceHeroVideo();
      }
    });
  });

  playHeroVideo(heroVideos[0]);
  scheduleHeroVideoAdvance();
}

(function () {
  var carousel = document.getElementById("practitioner-carousel");
  if (!carousel) return;
  var track = carousel.querySelector(".practitioner-carousel-track");
  var prevBtn = carousel.querySelector(".carousel-prev");
  var nextBtn = carousel.querySelector(".carousel-next");
  var quotes = carousel.querySelectorAll(".practitioner-quote");
  var current = 0;

  function goTo(index) {
    current = (index + quotes.length) % quotes.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); });
})();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") {
      return;
    }

    const target = document.querySelector(href);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
