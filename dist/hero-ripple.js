import { createLiquidRipple } from "./vendor/liquid-ripple/index.js";

const canvas = document.querySelector("#hero-ripple");
const hero = canvas?.closest(".hero");
const stage = hero?.querySelector(".hero-blueprint");
const core = stage?.querySelector(".blueprint-core");

if (canvas instanceof HTMLCanvasElement && hero instanceof HTMLElement && stage instanceof HTMLElement && core instanceof HTMLElement) {
  const paletteForTheme = () => document.documentElement.classList.contains("dark")
    ? { top: "#183b72", bottom: "#07152d", glint: "#9fc1ff" }
    : { top: "#dfeaff", bottom: "#8eb2f5", glint: "#ffffff" };

  const ripple = createLiquidRipple(canvas, {
    palette: paletteForTheme(),
    interactive: false,
    ambient: 0,
    maxRipples: 36,
    dprCap: 1.25,
    speed: 0.72,
    opacity: 0.88,
    respectReducedMotion: true,
    wave: {
      swell: 0.24,
      amplitude: 0.34,
      ringSpeed: 0.19,
      decay: 0.72,
      wavelength: 42,
      life: 6.4,
      refraction: 0.1,
      caustics: 0.05,
      specular: 0.4
    },
    onUnsupported: reason => hero.dataset.rippleFallback = reason
  });

  if (ripple) {
    hero.classList.add("ripple-ready");

    let origin = { x: 0.5, y: 0.5 };
    const syncOrigin = () => {
      const heroRect = hero.getBoundingClientRect();
      const coreRect = core.getBoundingClientRect();
      if (!heroRect.width || !heroRect.height) return;
      const x = coreRect.left + coreRect.width / 2 - heroRect.left;
      const y = coreRect.top + coreRect.height / 2 - heroRect.top;
      origin = { x: x / heroRect.width, y: y / heroRect.height };
      hero.style.setProperty("--ripple-origin-x", `${x}px`);
      hero.style.setProperty("--ripple-origin-y", `${y}px`);
    };
    const dropCenter = () => ripple.drop(origin.x, origin.y, "uv");

    syncOrigin();
    dropCenter();
    window.setTimeout(dropCenter, 320);
    window.setTimeout(dropCenter, 640);

    let lastPointerRipple = 0;
    const onPointerMove = event => {
      const now = performance.now();
      if (now - lastPointerRipple < 32) return;
      lastPointerRipple = now;
      ripple.drop(event.clientX, event.clientY);
    };
    const onPointerDown = event => ripple.drop(event.clientX, event.clientY);
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("resize", syncOrigin, { passive: true });

    let heroVisible = true;
    const visibilityObserver = new IntersectionObserver(entries => {
      heroVisible = Boolean(entries[0]?.isIntersecting);
      heroVisible ? ripple.resume() : ripple.pause();
    }, { threshold: 0.05 });
    visibilityObserver.observe(hero);

    const centerRippleTimer = window.setInterval(() => {
      if (heroVisible && !document.hidden) dropCenter();
    }, 900);

    const themeObserver = new MutationObserver(() => ripple.setPalette(paletteForTheme()));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("pagehide", () => {
      window.clearInterval(centerRippleTimer);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", syncOrigin);
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      ripple.destroy();
    }, { once: true });
  }
}
