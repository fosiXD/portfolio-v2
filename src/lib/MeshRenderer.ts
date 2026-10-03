// Fondo de gradiente de malla con grano. WebGL puro, sin React:
// MeshBackground.tsx solo llama a start() y destroy().

const VERTEX_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform float u_scroll;
uniform vec2 u_pointer;
uniform vec3 u_c0; // base (crema)
uniform vec3 u_c1; // amarillo
uniform vec3 u_c2; // durazno
uniform vec3 u_c3; // salvia
uniform vec3 u_c4; // lavanda
uniform float u_grain;
uniform float u_gsize; // = devicePixelRatio (grano de ~1px CSS)
uniform float u_scale;
uniform float u_strength;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float blob(vec2 p, vec2 c, float r) {
  vec2 d = p - c;
  return exp(-dot(d, d) / (r * r));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  p /= u_scale;
  float t = u_time;

  // deformación suave del espacio
  p += 0.10 * vec2(sin(p.y * 2.6 + t * 0.55), cos(p.x * 2.2 - t * 0.45));
  p += 0.05 * vec2(sin(p.y * 5.3 - t * 0.35), cos(p.x * 4.7 + t * 0.30));

  // el scroll arrastra y gira el campo de color
  float ang = u_scroll * 0.8;
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  p = R * p;
  p.y += u_scroll * 0.40;
  p += u_pointer * 0.04;

  // centros de las manchas, a la deriva lenta
  vec2 A = vec2(-0.50 + 0.16 * sin(t * 0.31), 0.18 + 0.12 * cos(t * 0.27));
  vec2 B = vec2( 0.66 + 0.12 * cos(t * 0.23), 0.12 + 0.14 * sin(t * 0.37));
  vec2 C = vec2( 0.12 + 0.18 * sin(t * 0.29 + 1.7), -0.46 + 0.08 * cos(t * 0.33));
  vec2 D = vec2( 0.82 + 0.08 * cos(t * 0.19 + 0.8), -0.40 + 0.08 * sin(t * 0.21));
  vec2 E = vec2( 0.05 + 0.18 * sin(t * 0.17), 0.40 + 0.08 * cos(t * 0.25));

  // la crema domina; los colores son manchas suaves encima
  float w0 = 1.0;
  float wy = (1.25 * blob(p, A, 0.60) + 0.65 * blob(p, E, 0.45)) * u_strength;
  float wp = 0.85 * blob(p, B, 0.50) * u_strength;
  float ws = 0.55 * blob(p, C, 0.45) * u_strength;
  float wl = 0.35 * blob(p, D, 0.30) * u_strength;
  float sum = w0 + wy + wp + ws + wl;

  // mezcla en luz lineal: las zonas intermedias no se ensucian
  vec3 g0 = pow(u_c0, vec3(2.2));
  vec3 g1 = pow(u_c1, vec3(2.2));
  vec3 g2 = pow(u_c2, vec3(2.2));
  vec3 g3 = pow(u_c3, vec3(2.2));
  vec3 g4 = pow(u_c4, vec3(2.2));
  vec3 lin = (g0 * w0 + g1 * wy + g2 * wp + g3 * ws + g4 * wl) / sum;
  vec3 col = pow(lin, vec3(1.0 / 2.2));

  // grano estático
  vec2 gp = floor(frag / u_gsize);
  col += (hash(gp) - 0.5) * u_grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const MAX_PIXEL_RATIO = 1.5;
/** Rapidez con la que scroll y puntero alcanzan su valor real (mayor = más brusco) */
const SMOOTHING = 3.5;

export type MeshOptions = {
  grain: number;
  speed: number;
  scale: number;
  strength: number;
};

const DEFAULT_OPTIONS: MeshOptions = {
  grain: 0.035,
  speed: 0.5,
  scale: 1,
  strength: 1,
};

const UNIFORM_NAMES = [
  "u_res",
  "u_time",
  "u_scroll",
  "u_pointer",
  "u_c0",
  "u_c1",
  "u_c2",
  "u_c3",
  "u_c4",
  "u_grain",
  "u_gsize",
  "u_scale",
  "u_strength",
] as const;
type UniformName = (typeof UNIFORM_NAMES)[number];
type Uniforms = Record<UniformName, WebGLUniformLocation>;

type RGB = readonly [number, number, number];

// Cada color del shader sale de un token CSS; el hex es el respaldo
const COLORS: readonly { uniform: UniformName; token: string; fallback: string }[] = [
  { uniform: "u_c0", token: "--bg-screen", fallback: "#fffaeb" },
  { uniform: "u_c1", token: "--primary", fallback: "#f9d56e" },
  { uniform: "u_c2", token: "--tag", fallback: "#f7b7a3" },
  { uniform: "u_c3", token: "--badge", fallback: "#b8d8ba" },
  { uniform: "u_c4", token: "--lavender", fallback: "#cfc8f0" },
];

/** Todo lo que existe solo si WebGL arrancó bien */
type GLState = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  uniforms: Uniforms;
};

function hexToRgb(hex: string): RGB | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) / 255, ((value >> 8) & 0xff) / 255, (value & 0xff) / 255];
}

function readTokenColor(token: string, fallback: string): RGB {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token);
  return hexToRgb(value) ?? hexToRgb(fallback) ?? [1, 1, 1];
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("MeshRenderer:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function getUniforms(gl: WebGLRenderingContext, program: WebGLProgram): Uniforms | null {
  const uniforms: Partial<Uniforms> = {};
  for (const name of UNIFORM_NAMES) {
    const location = gl.getUniformLocation(program, name);
    if (!location) return null;
    uniforms[name] = location;
  }
  // El bucle recorrió todos los nombres, así que ya no falta ninguno
  return uniforms as Uniforms;
}

/** Devuelve null si el navegador no tiene WebGL o si algo falla al preparar el shader */
function createGLState(canvas: HTMLCanvasElement): GLState | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return null;

  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!vertex || !fragment || !program || !buffer) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  const uniforms = getUniforms(gl, program);
  if (!uniforms) return null;

  gl.useProgram(program);

  // Un solo triángulo que cubre toda la pantalla
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  return { gl, program, buffer, uniforms };
}

export class MeshRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly options: MeshOptions;
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  private state: GLState | null = null;
  private frameId = 0;
  private lastFrame = 0;
  private time = 0;

  // "target" es el valor real; el otro lo persigue poco a poco en cada fotograma
  private scroll = 0;
  private scrollTarget = 0;
  private pointerX = 0;
  private pointerY = 0;
  private pointerTargetX = 0;
  private pointerTargetY = 0;

  constructor(canvas: HTMLCanvasElement, options: Partial<MeshOptions> = {}) {
    this.canvas = canvas;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  start(): void {
    this.state = createGLState(this.canvas);
    if (!this.state) return; // sin WebGL: se queda el degradado CSS de body

    const { gl, uniforms } = this.state;
    for (const { uniform, token, fallback } of COLORS) {
      const [r, g, b] = readTokenColor(token, fallback);
      gl.uniform3f(uniforms[uniform], r, g, b);
    }
    gl.uniform1f(uniforms.u_grain, this.options.grain);
    gl.uniform1f(uniforms.u_scale, this.options.scale);
    gl.uniform1f(uniforms.u_strength, this.options.strength);

    window.addEventListener("resize", this.handleResize);
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("pointermove", this.handlePointer, { passive: true });
    this.canvas.addEventListener("webglcontextlost", this.handleContextLost);
    this.reducedMotion.addEventListener("change", this.handleMotionChange);

    this.handleScroll();
    this.handleResize();
    this.handleMotionChange();
    this.canvas.setAttribute("data-ready", "");
  }

  destroy(): void {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("pointermove", this.handlePointer);
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.reducedMotion.removeEventListener("change", this.handleMotionChange);
    this.canvas.removeAttribute("data-ready");

    if (this.state) {
      this.state.gl.deleteProgram(this.state.program);
      this.state.gl.deleteBuffer(this.state.buffer);
      this.state = null;
    }
  }

  // Los manejadores son funciones flecha para que "this" siga siendo el renderer
  // cuando el navegador los llama.

  private handleResize = (): void => {
    if (!this.state) return;
    const { gl, uniforms } = this.state;
    const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
    const width = Math.round(this.canvas.clientWidth * ratio);
    const height = Math.round(this.canvas.clientHeight * ratio);

    this.canvas.width = width;
    this.canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.u_res, width, height);
    gl.uniform1f(uniforms.u_gsize, ratio);

    if (this.reducedMotion.matches) this.draw();
  };

  private handleScroll = (): void => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollTarget = max > 0 ? window.scrollY / max : 0;
  };

  private handlePointer = (event: PointerEvent): void => {
    // de -1 a 1, con el centro de la pantalla en 0 y la Y hacia arriba
    this.pointerTargetX = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointerTargetY = 1 - (event.clientY / window.innerHeight) * 2;
  };

  private handleContextLost = (): void => {
    cancelAnimationFrame(this.frameId);
    this.canvas.removeAttribute("data-ready"); // vuelve a verse el degradado CSS
  };

  private handleMotionChange = (): void => {
    cancelAnimationFrame(this.frameId);
    if (this.reducedMotion.matches) {
      // un solo fotograma estático, sin scroll ni puntero
      this.time = 0;
      this.scroll = 0;
      this.pointerX = 0;
      this.pointerY = 0;
      this.draw();
    } else {
      this.lastFrame = performance.now();
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private tick = (now: number): void => {
    // dt en segundos; el tope evita un salto al volver a la pestaña
    const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
    this.lastFrame = now;
    this.time += dt * this.options.speed;

    const k = 1 - Math.exp(-dt * SMOOTHING);
    this.scroll += (this.scrollTarget - this.scroll) * k;
    this.pointerX += (this.pointerTargetX - this.pointerX) * k;
    this.pointerY += (this.pointerTargetY - this.pointerY) * k;

    this.draw();
    this.frameId = requestAnimationFrame(this.tick);
  };

  private draw(): void {
    if (!this.state) return;
    const { gl, uniforms } = this.state;
    gl.uniform1f(uniforms.u_time, this.time);
    gl.uniform1f(uniforms.u_scroll, this.scroll);
    gl.uniform2f(uniforms.u_pointer, this.pointerX, this.pointerY);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
