// src/color.ts
function toRgbFloat(color) {
  if (typeof color !== "string") {
    const [r, g, b] = color;
    const normalized = r <= 1 && g <= 1 && b <= 1;
    const scale = normalized ? 1 : 1 / 255;
    return [clamp01(r * scale), clamp01(g * scale), clamp01(b * scale)];
  }
  const hex = color.trim().replace(/^#/, "");
  const full = hex.length === 3 || hex.length === 4 ? hex.slice(0, 3).split("").map((c) => c + c).join("") : hex.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(full)) {
    throw new Error(`liquid-ripple: could not parse color "${color}"`);
  }
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255
  ];
}
function clamp01(n) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

// src/presets.ts
var PALETTES = {
  /** Bright tropical shallows — the one on axistify.com/demo. */
  lagoon: { top: "#8cded1", bottom: "#0a8073", glint: "#f2fffc" },
  /** Deep teal at night. Reads well behind light text. */
  deep: { top: "#043238", bottom: "#01141c", glint: "#8cf2e6" },
  /** Chlorinated swimming pool, midday. */
  pool: { top: "#7fe3f0", bottom: "#0e7490", glint: "#ffffff" },
  /** Navy ocean — cold, corporate. */
  ink: { top: "#0b2545", bottom: "#01060f", glint: "#7fb2ff" },
  /** Violet dusk. */
  dusk: { top: "#2a1b4a", bottom: "#0b0616", glint: "#c9a6ff" },
  /** Warm copper — sunset on the water. */
  ember: { top: "#7a3418", bottom: "#1d0803", glint: "#ffc48c" }
};
function resolvePalette(palette = "deep") {
  const p = typeof palette === "string" ? PALETTES[palette] ?? PALETTES.deep : palette;
  return {
    top: toRgbFloat(p.top),
    bottom: toRgbFloat(p.bottom),
    glint: toRgbFloat(p.glint)
  };
}

// src/shaders.ts
var VERTEX_SHADER = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;
function fragmentShader(maxRipples) {
  return `
precision highp float;

uniform vec2  u_res;
uniform float u_time;

uniform vec3  u_top;
uniform vec3  u_bottom;
uniform vec3  u_glint;
uniform float u_opacity;

uniform float u_swell;
uniform float u_amplitude;
uniform float u_ringSpeed;
uniform float u_decay;
uniform float u_wavelength;
uniform float u_life;
uniform float u_refraction;
uniform float u_caustics;
uniform float u_specular;

// x, y in aspect-corrected space (y up); z = spawn time, negative = empty slot
uniform vec3  u_ripples[${maxRipples}];

float height(vec2 p) {
  float h = 0.0;

  // Ambient swell \u2014 two crossing waves at different scales.
  h += u_swell * 0.016 * sin(p.x * 6.0 + u_time * 0.70) * sin(p.y * 5.0 - u_time * 0.55);
  h += u_swell * 0.010 * sin((p.x + p.y) * 9.0 - u_time * 0.90);

  for (int i = 0; i < ${maxRipples}; i++) {
    vec3 r = u_ripples[i];
    if (r.z < 0.0) continue;
    float age = u_time - r.z;
    if (age < 0.0 || age > u_life) continue;

    // Ring expands outward at u_ringSpeed; the wave packet is tight around it
    // and its whole envelope fades with age.
    float d    = distance(p, r.xy);
    float ring = d - age * u_ringSpeed;
    float amp  = exp(-age * u_decay) * exp(-abs(ring) * 20.0) * u_amplitude;
    h += amp * sin(ring * u_wavelength - age * 4.0);
  }
  return h;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;

  // Aspect-corrected sample point so ripples stay circular, not oval.
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;

  // Surface normal by finite difference of the height field.
  float e  = 0.0025;
  float h  = height(p);
  float hx = height(p + vec2(e, 0.0));
  float hy = height(p + vec2(0.0, e));
  vec3  n  = normalize(vec3(h - hx, h - hy, e * 14.0));

  // Refract the gradient through the surface. gl_FragCoord is y-up, so
  // ruv.y == 1 is the top of the canvas \u2014 hence u_top as the far end of mix().
  vec2 ruv = uv + n.xy * u_refraction;
  vec3 col = mix(u_bottom, u_top, ruv.y);

  // Caustics: crossing sines, sharpened by a high power.
  float caust = pow(abs(sin(ruv.x * 14.0 + u_time * 0.5) * sin(ruv.y * 12.0 - u_time * 0.4)), 8.0);
  col += u_glint * caust * u_caustics;

  // Specular glint off the ripple crests.
  vec3  light = normalize(vec3(0.35, 0.5, 0.8));
  float spec  = pow(max(dot(n, light), 0.0), 60.0);
  col += u_glint * spec * u_specular;

  gl_FragColor = vec4(col, u_opacity);
}
`;
}

// src/core.ts
var DEFAULT_WAVE = {
  swell: 1,
  amplitude: 0.34,
  ringSpeed: 0.32,
  decay: 1.5,
  wavelength: 60,
  life: 5,
  refraction: 0.12,
  caustics: 0.3,
  specular: 0.85
};
function isSupported(options = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (options.respectReducedMotion !== false && prefersReducedMotion()) return false;
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      probe.getContext("webgl") ?? probe.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}
function createLiquidRipple(canvas, options = {}) {
  const {
    palette = "deep",
    wave,
    maxRipples = 24,
    interactive = true,
    ambient = 2300,
    pointerThrottle = 110,
    dprCap = 1.5,
    speed = 1,
    opacity = 1,
    respectReducedMotion = true,
    onUnsupported
  } = options;
  if (typeof window === "undefined") return null;
  if (respectReducedMotion && prefersReducedMotion()) {
    onUnsupported?.("reduced-motion");
    return null;
  }
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: opacity < 1,
    premultipliedAlpha: false
  }) ?? null;
  if (!gl) {
    onUnsupported?.("no-webgl");
    return null;
  }
  const slots = Math.max(1, Math.floor(maxRipples));
  const ripples = new Float32Array(slots * 3).fill(-1);
  let cursor = 0;
  let colors = resolvePalette(palette);
  const feel = { ...DEFAULT_WAVE, ...wave };
  let rate = speed;
  const alpha = clamp(opacity, 0, 1);
  let program = null;
  let buffer = null;
  let u = null;
  let sized = { w: -1, h: -1 };
  function build() {
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader(slots));
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    if (!prog) return false;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return false;
    }
    gl.useProgram(prog);
    program = prog;
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const loc = {};
    for (const name of UNIFORMS) {
      loc[name] = gl.getUniformLocation(prog, `u_${name}`);
    }
    u = loc;
    if (alpha < 1) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    pushPalette();
    pushWave();
    gl.uniform1f(loc.opacity, alpha);
    sized = { w: -1, h: -1 };
    return true;
  }
  function pushPalette() {
    if (!u) return;
    gl.uniform3fv(u.top, colors.top);
    gl.uniform3fv(u.bottom, colors.bottom);
    gl.uniform3fv(u.glint, colors.glint);
  }
  function pushWave() {
    if (!u) return;
    gl.uniform1f(u.swell, feel.swell);
    gl.uniform1f(u.amplitude, feel.amplitude);
    gl.uniform1f(u.ringSpeed, feel.ringSpeed);
    gl.uniform1f(u.decay, feel.decay);
    gl.uniform1f(u.wavelength, feel.wavelength);
    gl.uniform1f(u.life, Math.max(0.05, feel.life));
    gl.uniform1f(u.refraction, feel.refraction);
    gl.uniform1f(u.caustics, feel.caustics);
    gl.uniform1f(u.specular, feel.specular);
  }
  if (!build()) {
    onUnsupported?.("shader-error");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  function syncSize() {
    const dpr = Math.min(Math.max(0.25, dprCap), window.devicePixelRatio || 1);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (w === sized.w && h === sized.h) return canvas.clientWidth > 0;
    sized = { w, h };
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    return canvas.clientWidth > 0;
  }
  let observer = null;
  const onWindowResize = () => {
    sized = { w: -1, h: -1 };
  };
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(onWindowResize);
    observer.observe(canvas);
  } else {
    window.addEventListener("resize", onWindowResize);
  }
  let clock = 0;
  let last = 0;
  let raf = 0;
  let running = false;
  function aspect() {
    return canvas.clientWidth / Math.max(1, canvas.clientHeight);
  }
  function spawn(nx, ny) {
    ripples[cursor * 3] = nx * aspect();
    ripples[cursor * 3 + 1] = 1 - ny;
    ripples[cursor * 3 + 2] = clock;
    cursor = (cursor + 1) % slots;
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    clock += Math.min(0.1, Math.max(0, (now - last) / 1e3)) * rate;
    last = now;
    if (!u || document.hidden) return;
    if (!syncSize()) return;
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.time, clock);
    gl.uniform3fv(u.ripples, ripples);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
  }
  const target = interactive === false ? null : interactive === "canvas" ? canvas : window;
  let lastMove = 0;
  const onMove = (ev) => {
    const now = performance.now();
    if (now - lastMove < pointerThrottle) return;
    lastMove = now;
    dropClient(ev);
  };
  const onDown = (ev) => dropClient(ev);
  function dropClient(ev) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    spawn(
      (ev.clientX - rect.left) / rect.width,
      (ev.clientY - rect.top) / rect.height
    );
  }
  target?.addEventListener("pointermove", onMove, { passive: true });
  target?.addEventListener("pointerdown", onDown, { passive: true });
  const ambientTimer = ambient > 0 ? window.setInterval(() => {
    if (document.hidden || !running) return;
    spawn(Math.random(), Math.random());
  }, ambient) : 0;
  const onLost = (ev) => {
    ev.preventDefault();
    stop();
    u = null;
    program = null;
    buffer = null;
  };
  const onRestored = () => {
    if (build()) start();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  start();
  return {
    canvas,
    drop(x, y, space = "client") {
      if (space === "uv") return spawn(x, y);
      if (space === "canvas") {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h) return;
        return spawn(x / w, y / h);
      }
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      spawn((x - rect.left) / rect.width, (y - rect.top) / rect.height);
    },
    setPalette(next) {
      colors = resolvePalette(next);
      pushPalette();
    },
    setWave(next) {
      Object.assign(feel, next);
      pushWave();
    },
    setSpeed(next) {
      rate = next;
    },
    pause: stop,
    resume: start,
    destroy() {
      stop();
      if (ambientTimer) window.clearInterval(ambientTimer);
      target?.removeEventListener("pointermove", onMove);
      target?.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      observer?.disconnect();
      window.removeEventListener("resize", onWindowResize);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      u = null;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  };
}
var UNIFORMS = [
  "res",
  "time",
  "top",
  "bottom",
  "glint",
  "opacity",
  "swell",
  "amplitude",
  "ringSpeed",
  "decay",
  "wavelength",
  "life",
  "refraction",
  "caustics",
  "specular",
  "ripples"
];
function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
function prefersReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function clamp(n, min, max) {
  return n < min ? min : n > max ? max : n;
}

export {
  toRgbFloat,
  PALETTES,
  resolvePalette,
  VERTEX_SHADER,
  fragmentShader,
  DEFAULT_WAVE,
  isSupported,
  createLiquidRipple
};
//# sourceMappingURL=chunk-5DBRBCS5.js.map
