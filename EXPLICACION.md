# Cómo funciona este portfolio, explicado sin prisa

Guía para leer el código de `src/` de principio a fin. Cada apartado sigue el mismo orden:

1. **Qué problema resuelve** el archivo.
2. **A qué se parece** de lo que ya conoces (Java, C#, Node, discord.js).
3. **El código**, trozo a trozo.
4. **Pruébalo**: un cambio pequeño que puedes hacer para ver qué pasa.

Léela con el proyecto abierto y `npm run dev` corriendo. Los "Pruébalo" son la parte que más enseña.

---

## 0. El mapa

```
index.html            → la única página HTML. Solo tiene <div id="root">
src/main.tsx          → enciende React y lo mete en ese div
src/App.tsx           → la lista de piezas de la página, en orden
src/components/       → piezas que se reutilizan o no son una sección
src/sections/         → las 4 secciones: Hero, Skills, About, Contact
src/data/             → datos puros (sin nada visual): menú, skills, enlaces
src/hooks/            → useActiveSection: "¿qué sección estoy viendo?"
src/lib/              → MeshRenderer: el fondo animado (WebGL, sin React)
src/styles/           → tokens.css (colores) y global.css (reglas comunes)
```

La idea que ordena todo: **los datos viven en `data/`, los componentes solo los pintan**. Si mañana agregas una tecnología, tocas `data/skills.ts` y nada más.

Es lo mismo que hacías en el SupermarketSystem: `MockDatabase` tenía los datos, `InventoryManager` la lógica. Aquí `data/` es tu `MockDatabase`, y los componentes son quien imprime en pantalla.

---

## 1. `main.tsx` y `App.tsx`: el arranque

### Qué problema resuelven

El navegador solo entiende HTML. `main.tsx` es el `public static void main` del proyecto: busca el `<div id="root">` de `index.html` y le dice a React "dibuja `<App />` aquí dentro".

### El código

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- `document.getElementById('root')` puede devolver `null` (si el div no existiera). El `!` del final le dice a TypeScript "confía en mí, existe". Es la única vez en el proyecto que se usa `!`, porque aquí sabemos seguro que el div está en `index.html`.
- `<StrictMode>` es un modo de pruebas: en desarrollo **monta cada componente, lo desmonta y lo vuelve a montar**. Parece absurdo, pero sirve para cazar un error concreto: efectos que no se limpian. Lo vas a ver en acción en el apartado 5.

Encima de eso hay tres imports que no traen código, sino estilos:

```tsx
import '@fontsource/lemon'      // la fuente Lemon
import './styles/tokens.css'    // los colores
import './styles/global.css'    // las reglas comunes
```

Y `App.tsx` es solo una lista ordenada:

```tsx
export default function App() {
  return (
    <>
      <MeshBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
```

- `<> ... </>` es un **fragmento**: una función solo puede devolver una cosa, y el fragmento es una caja invisible que agrupa varias sin añadir un `<div>` de más al HTML.
- `App` no tiene lógica. Si quieres saber qué hay en la página y en qué orden, se lee aquí en 10 segundos.

> **El error que había aquí.** Tu `App.tsx` devolvía `<App />` dentro de `App`. Eso es una función que se llama a sí misma sin condición de salida: recursión infinita, como un método de Java que se invoca a sí mismo sin `if`. React revienta con "Maximum call stack size exceeded".

### Pruébalo

Cambia de sitio `<About />` y `<Skills />` en `App.tsx`. La página se reordena y el menú sigue marcando bien la sección activa, porque el hook busca cada sección por su `id`, no por su posición. (El orden de los enlaces del menú es aparte: sale del array `NAV` de `data/nav.ts`.)

---

## 2. `styles/tokens.css`: los colores con nombre

### Qué problema resuelve

Si escribes `#f9d56e` en 14 archivos y un día cambias el amarillo, tienes que buscarlo 14 veces. Con una variable lo cambias en un sitio.

### A qué se parece

A las constantes: `public static final String PRIMARY = "#f9d56e";`. Solo que en CSS.

### El código

```css
:root {
  --primary: #f9d56e;
  --primary-text: #3d3226;
  --navbar-height: 82px;
}
```

Y se usan así, en cualquier `.css`:

```css
.nav-item a[aria-current] { background: var(--primary); }
```

Los nombres son **los mismos que las variables de Figma**. Así, cuando Figma dice `primary-text`, sabes exactamente qué variable usar.

### Pruébalo

Cambia `--primary` a `hotpink` y guarda. Se ponen rosas a la vez los badges del hero, el enlace activo del menú, el botón de Discord y las manchas del fondo (sí, el shader también lee este token; lo verás en el apartado 9).

---

## 3. `data/nav.ts`: la fuente única de las secciones

Este es el archivo con más TypeScript "raro" del proyecto. Vale la pena ir despacio.

### Qué problema resuelve

Los nombres de las secciones (`inicio`, `habilidades`, `sobre-mi`, `contacto`) aparecen en muchos sitios: los `id` del HTML, los `href` del menú, el hook que detecta la sección activa. Si en uno escribes `sobre-mí` con tilde, nada funciona y **nadie te avisa**. Este archivo hace que TypeScript te avise.

### Línea 1: la lista

```ts
export const SECTIONS = ["inicio", "sobre-mi", "habilidades", "contacto"] as const;
```

Sin `as const`, TypeScript piensa: "es un `string[]`, una lista de textos cualquiera". Con `as const` piensa: "es **exactamente** esta lista, con estos 4 textos, y no cambia".

### Línea 2: el tipo sacado de la lista

```ts
export type sectionId = (typeof SECTIONS)[number];
```

Se lee de dentro hacia fuera:

| Trozo | Significa |
|---|---|
| `typeof SECTIONS` | "el tipo de esa lista" |
| `[number]` | "lo que sale al pedir cualquier posición" |
| resultado | `"inicio" \| "sobre-mi" \| "habilidades" \| "contacto"` |

Eso es una **unión de literales**: un tipo que solo acepta esos 4 textos exactos.

**A qué se parece:** a un `enum` de Java o C#.

```java
enum Section { INICIO, SOBRE_MI, HABILIDADES, CONTACTO }
```

La diferencia: aquí los valores son los textos reales que van en el HTML, y el tipo **se genera solo** a partir de la lista. Agregas `"proyectos"` a `SECTIONS` y `sectionId` ya lo incluye, sin tocar nada más.

```ts
const a: sectionId = "contacto";   // ✅
const b: sectionId = "contato";    // ❌ error al escribirlo, no al ejecutar
```

### El tipo del enlace

```ts
export type NavLink = {
  id: sectionId;
  label: string;
  href: `#${sectionId}`;
};
```

`` `#${sectionId}` `` es un **tipo de plantilla**: "un `#` seguido de un `sectionId`". O sea, solo acepta `"#inicio"`, `"#habilidades"`, `"#sobre-mi"` o `"#contacto"`.

> **El error que había en tu Navbar.** Tenías `<a href="inicio">`, sin `#`. El navegador lo interpreta como "ve a la página `/inicio`", que no existe. Como ese `href` era un texto suelto, TypeScript no podía avisarte. En el `Footer` verás que los `href` están tipados como `` `#${sectionId}` ``: ahí ese mismo fallo no compila.

### La función guardia

```ts
export const isSectionId = (value: string): value is sectionId =>
  (SECTIONS as readonly string[]).includes(value);
```

El problema: el `id` de un elemento HTML es un `string` cualquiera. ¿Cómo lo convertimos en `sectionId` sin mentirle a TypeScript?

`value is sectionId` es una **promesa al compilador**: "si esta función devuelve `true`, puedes tratar `value` como `sectionId`".

```ts
const id: string = elemento.id;

setActive(id);              // ❌ string no es sectionId
if (isSectionId(id)) {
  setActive(id);            // ✅ aquí dentro, id ya es sectionId
}
```

**A qué se parece:** al `if (obj instanceof Customer)` de Java, o al `if (obj is Customer c)` de C#. Compruebas primero y, dentro del `if`, el compilador ya sabe qué tienes. Eso se llama **estrechar** el tipo.

Ahora mismo ningún archivo la usa (el hook del apartado 5 dejó de necesitarla), pero es el patrón que usarás cada vez que un dato llegue "de fuera": un `id` del HTML, la URL, una respuesta de una API.

### Pruébalo

En `data/nav.ts`, cambia `href: '#contacto'` por `href: '#contato'`. El editor lo subraya en rojo al instante. Ese es todo el sentido del archivo.

---

## 4. `NavItem.tsx`: un componente y sus props

### Qué problema resuelve

Pinta un enlace del menú. Tiene dos caras, como el componente de Figma: normal y seleccionado.

### A qué se parece

Un componente es **una función que recibe datos y devuelve HTML**. Las **props** son sus parámetros. Nada más.

### El código

```tsx
export type NavItemEstado = "normal" | "seleccionado";

type NavItemProps = Pick<NavLink, "label" | "href"> & {
  estado?: NavItemEstado;
};
```

- `Pick<NavLink, "label" | "href">`: "del tipo `NavLink`, quédate solo con `label` y `href`". Así no se repite la definición: si `href` cambia en `nav.ts`, aquí cambia solo.
- `&` junta dos tipos en uno.
- `estado?` con `?` significa **opcional**.

```tsx
export function NavItem({ label, href, estado = "normal" }: NavItemProps) {
  return (
    <li className="nav-item">
      <a href={href} aria-current={estado === "seleccionado" ? "location" : undefined}>
        {label}
      </a>
    </li>
  );
}
```

- `{ label, href, estado = "normal" }` es **desestructurar** con valor por defecto. Lo mismo que hacías en discord.js con `const { commandName, options } = interaction;`.
- `aria-current="location"` le dice a un lector de pantalla "estás aquí". Si el valor es `undefined`, React **no escribe el atributo**.

### El truco: el CSS se cuelga de la accesibilidad

```css
.nav-item a[aria-current] { background: var(--primary); }
```

No hay una clase `.activo`. El fondo amarillo aparece **cuando existe el atributo `aria-current`**. Ventaja: es imposible que el enlace se vea activo pero el lector de pantalla no lo sepa (o al revés), porque las dos cosas salen del mismo dato.

### Pruébalo

En `Navbar.tsx`, cambia `estado={active === id ? "seleccionado" : "normal"}` por `estado="seleccionado"`. Los tres enlaces se ponen amarillos.

---

## 5. `useActiveSection.ts`: estado y efectos

Aquí están los dos conceptos de React que más cuestan: `useState` y `useEffect`.

### Qué problema resuelve

Responde a una pregunta: **¿qué sección tiene el usuario delante ahora mismo?**

### `useState`: una variable que React vigila

```ts
const [active, setActive] = useState<sectionId>(SECTIONS[0]);
```

- `active` es el valor actual. Empieza en `"inicio"`.
- `setActive` es **la única forma** de cambiarlo.
- `<sectionId>` limita lo que puede guardar: solo uno de los 4 textos.

¿Por qué no una variable normal? Porque React no se entera de que cambió:

```ts
let active = "inicio";
active = "contacto";      // cambia, pero la pantalla NO se actualiza

setActive("contacto");    // cambia Y React vuelve a ejecutar el componente
```

**A qué se parece:** a un setter que además dispara un evento "repinta la pantalla".

### `useEffect`: conectar con algo de fuera de React

```ts
useEffect(() => {
  const update = () => setActive(findActiveSection());

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);

  return () => {                                    // la limpieza
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  };
}, []);
```

Un efecto es para **hablar con algo que React no controla**. Aquí, el scroll de la ventana.

Tiene tres partes:

| Parte | Qué es | En discord.js sería |
|---|---|---|
| El cuerpo | Lo que se hace al aparecer el componente | `client.on('messageCreate', handler)` |
| El `return () => ...` | La **limpieza**, al desaparecer | `client.off('messageCreate', handler)` |
| El `[]` del final | "Hazlo una sola vez" | — |

**¿Por qué importa la limpieza?** Por el `StrictMode` del apartado 1: en desarrollo, React monta → desmonta → vuelve a montar. Sin el `return`, acabarías con **dos** listeners de scroll activos. Es lo mismo que registrar dos veces el mismo listener en un bot y que responda dos veces a cada mensaje.

Fíjate en que `update` se guarda en una constante: para quitar un listener hay que pasar **la misma función** que se registró, no una copia.

### `findActiveSection`: la regla para decidir

Es una función normal, fuera del hook, sin nada de React. Imagina una línea horizontal al 20% de la pantalla:

```
┌───────────── pantalla ─────────────┐
│                                    │
│------------------------------------│  ← la línea (20%)
│                                    │
│                                    │
│                                    │
└────────────────────────────────────┘
```

La sección activa es **la última cuyo borde de arriba ya subió por encima de esa línea**.

```ts
const top = el.getBoundingClientRect().top;   // distancia del borde superior al tope de la pantalla

if (top <= line && top > activeTop) {
  active = id;
  activeTop = top;
}
```

Es el clásico "buscar el máximo" de un bucle: de todas las secciones que ya pasaron la línea (`top <= line`), se queda con la que está más abajo (`top > activeTop`).

Ejemplo, con una pantalla de 1000px (línea en 200px):

| Sección | `top` | ¿Pasó la línea? |
|---|---|---|
| inicio | -1400 | sí |
| sobre-mi | -300 | sí ← la más baja de las que pasaron: **activa** |
| habilidades | 450 | no |
| contacto | 900 | no |

**El caso especial.** "Contacto" es corta y debajo tiene el footer. Al llegar al final de la página no puedes seguir bajando, así que su borde quizá nunca alcanza la línea. Por eso hay una segunda regla: si el scroll está al fondo (`atBottom`), gana la sección de más abajo.

**¿No es caro hacer esto en cada scroll?** Son 4 mediciones. Y `setActive` con el mismo valor que ya tenía **no repinta nada**: React compara y, si es igual, no hace nada. La pantalla solo se actualiza las pocas veces que la sección cambia de verdad.

> **Un cambio respecto a tu guía.** Tu hook usaba `IntersectionObserver` con una franja fina. Funcionaba mientras cada sección medía una pantalla entera. Al compactar las secciones, "Contacto" dejó de llegar a la franja y el menú nunca la marcaba, así que lo cambié por esta regla. La guardia `isSectionId` del apartado 3 sigue en `nav.ts`, pero el hook ya no la necesita: ahora recorre `SECTIONS`, que ya son `sectionId`.

### Por qué el hook se llama una sola vez

Cada llamada a un hook con estado crea **su propia copia**. Si `Navbar` y `Footer` llamaran los dos a `useActiveSection()`, habría el doble de listeners y dos estados que no se conocen. Por eso se llama solo en `Navbar`.

**A qué se parece:** a hacer `new InventoryManager()` dos veces. Son dos objetos distintos; lo que le pase a uno no lo sabe el otro.

### Pruébalo

Añade `console.log("activa:", active);` antes del `return active;`, abre la consola y haz scroll. Verás cambiar el valor justo cuando el borde de cada sección cruza la línea. Luego cambia `LINE` de `0.2` a `0.8`: el menú cambia mucho antes, cuando la sección apenas asoma por abajo.

---

## 6. `Navbar.tsx`: calcular en vez de guardar

### El código que importa

```tsx
export function Navbar({ showLogo }: NavbarProps) {
  const active = useActiveSection();
  const logoVisible = showLogo ?? active !== "inicio";
```

`logoVisible` **no es un estado**. Es una cuenta que se hace cada vez que la función se ejecuta.

La regla, que es de las más importantes de React: **si algo se puede calcular a partir de props o estado, se calcula; no se guarda**.

```tsx
// ❌ Mal: dos datos que hay que mantener sincronizados a mano
const [logoVisible, setLogoVisible] = useState(false);
useEffect(() => { setLogoVisible(active !== "inicio"); }, [active]);

// ✅ Bien: un solo dato, y el otro se deduce
const logoVisible = active !== "inicio";
```

La versión mala funciona, pero pinta la pantalla dos veces y deja la puerta abierta a que los dos datos se contradigan.

**A qué se parece:** a no guardar `total` en una factura cuando ya tienes `precio` y `cantidad`. Lo calculas al pedirlo y nunca puede estar mal.

### El operador `??`

```tsx
showLogo ?? active !== "inicio"
```

"Usa `showLogo`; pero si es `undefined`, usa lo de la derecha". Da tres comportamientos:

| Se escribe | Resultado |
|---|---|
| `<Navbar />` | El logo aparece al salir del hero |
| `<Navbar showLogo />` | Siempre visible |
| `<Navbar showLogo={false} />` | Nunca visible |

Ojo: `??` no es `||`. Con `||`, `showLogo={false}` se trataría como "no me pasaron nada".

### Las listas y la `key`

```tsx
{NAV.map(({ id, label, href }) => (
  <NavItem key={id} label={label} href={href}
           estado={active === id ? "seleccionado" : "normal"} />
))}
```

- `.map` convierte cada dato en un componente. Tres datos en `NAV`, tres `<NavItem>`.
- `key` es la etiqueta con la que React distingue los elementos de una lista. Tiene que ser única y estable. Es el equivalente a la clave primaria de una tabla.

> **El error que había aquí.** Tu `.map` envolvía cada `<NavItem>` en su propio `<ul role="list">`, y la `key` estaba en el `NavItem` de dentro. Salían tres listas de un elemento dentro de otra lista (HTML inválido: un `<ul>` solo puede tener `<li>` como hijos), y React avisaba de que faltaba la `key`, porque tiene que ir en el elemento **más externo** que devuelve el `.map`.

### El logo siempre está, solo se esconde

```tsx
<a className="navbar-logo" href="#inicio" data-visible={logoVisible}>
```

```css
.navbar-logo { transition: opacity 0.25s, visibility 0.25s; }
.navbar-logo[data-visible="false"] { opacity: 0; visibility: hidden; }
```

Con `{logoVisible && <a>...</a>}` el logo aparecería y desaparecería de golpe: un elemento que no existe no se puede animar. Dejándolo siempre en la página y cambiando un atributo, el CSS puede hacer el fundido. `visibility: hidden` además lo quita de la navegación con Tab mientras no se ve.

### Pruébalo

Escribe `<Navbar showLogo />` en `App.tsx`. El logo se queda fijo desde el principio.

---

## 7. Las secciones: datos tipados + `.map`

`Hero`, `Skills`, `About` y `Contact` repiten el patrón que ya viste. Lo nuevo de cada una:

### `Hero.tsx`: cómo se lee el nombre

```tsx
<h1 className="hero-name" aria-label="Only Fosi, Full-Stack Developer y Discord Bot Developer">
  <span className="hero-row hero-row--top" aria-hidden="true">
    <span>&lt;Only</span>
    <span className="hero-badge">Full-Stack Developer</span>
  </span>
  <span className="hero-row hero-row--bottom" aria-hidden="true">
    <span className="hero-badge">Discord Bot Developer</span>
    <span>Fosi /&gt;</span>
  </span>
</h1>
```

- `&lt;` y `&gt;` son `<` y `>`. Hay que escribirlos así porque, en JSX, un `<` suelto empieza una etiqueta.
- Visualmente el nombre está partido y mezclado con los badges. Un lector de pantalla leería "menor que Only Full-Stack Developer Discord Bot Developer Fosi barra mayor que". Por eso el `<h1>` lleva un `aria-label` con la frase bien dicha, y las filas llevan `aria-hidden="true"` ("esto es decoración, sáltatelo").

### `Hero.css`: todo cuelga de un número

```css
.hero-name { --fs: clamp(2rem, 9vw, 4rem); font-size: var(--fs); }
.hero-row + .hero-row { margin-top: calc(var(--fs) * -0.34375); }
.hero-badge { font-size: max(calc(var(--fs) * 0.25), 11px); }
```

- `clamp(mínimo, ideal, máximo)`: "usa el 9% del ancho de pantalla, pero nunca menos de 32px ni más de 64px". Es lo que hace el diseño responsive sin media queries.
- Los demás tamaños son **proporciones** de `--fs`. En Figma el nombre mide 64px y las filas se solapan 22px: `22 / 64 = 0.34375`. Si el nombre encoge en móvil, el solape encoge igual y el dibujo no se deforma.

### El `·` centrado

```css
.hero-profession { display: grid; grid-template-columns: 1fr auto 1fr; }
```

Tres columnas: la de la izquierda y la de la derecha miden **lo mismo** (`1fr` cada una) y el punto ocupa lo justo (`auto`). Como los dos lados son iguales, el punto cae en el centro exacto de la página aunque un texto sea más largo que el otro. Con un `flex` centrado, el punto se desviaría hacia el texto corto.

### `data/skills.ts` y `Skills.tsx`

```ts
import javascript from "../assets/icons/tech/javascript.svg";

export type Skill = { id: string; name: string; icon: string };

export const SKILLS: readonly Skill[] = [
  { id: "javascript", name: "JavaScript", icon: javascript },
  // ...
];
```

- Importar un `.svg` no trae el dibujo: Vite te da **la dirección** del archivo (un `string`), lista para un `<img src>`.
- `readonly Skill[]`: nadie puede hacer `SKILLS.push(...)` por accidente.

```tsx
{SKILLS.map(({ id, name, icon }) => (
  <li key={id} className="skill">
    <img src={icon} width={48} height={48} alt="" />
    <span>{name}</span>
  </li>
))}
```

`alt=""` es a propósito: el nombre ya está escrito debajo, y con un `alt` relleno el lector de pantalla diría "JavaScript JavaScript".

Las filas de 7 y 6 íconos no están programadas:

```css
.skills-grid { display: flex; flex-wrap: wrap; justify-content: center; max-width: 824px; }
```

7 celdas de 104px más 6 huecos de 16px son 824px. Caben 7 justas; las 6 que sobran bajan solas y quedan centradas.

### `About.tsx`

Las tres tarjetas son un array `SERVICES` y un `.map`. Lo interesante es el CSS:

```css
.about-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
```

"Mete tantas columnas como quepan, de 240px como mínimo, y reparte el resto a partes iguales". En escritorio salen 3; en una tablet, 2; en móvil, 1. Y como `grid` estira las celdas de una misma fila, las tres tarjetas miden lo mismo de alto aunque el texto sea distinto.

### Títulos: `h1`, `h2`, `h3`

En Figma todos los títulos grandes se ven iguales, pero en el HTML solo el hero es `<h1>`. Las demás secciones usan `<h2>`. Una página tiene un solo título principal; el tamaño se lo da el CSS (`.section-title`), no la etiqueta. Es como el índice de un documento: la etiqueta marca el nivel, no el aspecto.

### Pruébalo

Añade `{ id: "docker", name: "Docker", icon: react }` al final de `SKILLS`. Aparece un ícono 14, la segunda fila pasa a tener 7, y no tocaste ni el componente ni el CSS.

---

## 8. `data/links.ts` y `OptionalLink.tsx`: enlaces que aún no existen

### Qué problema resuelve

Todavía no tienes las URLs de tus redes. Hay dos formas malas de resolverlo: poner `href="#"` (un enlace que no lleva a ningún sitio y que acabará olvidado en producción) o no pintar los íconos (y el footer no se parece al diseño).

### El código

```ts
export type ExternalLink = {
  label: string;
  url: string | null;
};
```

`string | null` dice, en el propio tipo: **"puede que todavía no haya URL"**. Y obliga a quien lo use a pensar en ese caso:

```tsx
export function OptionalLink({ url, className, label, children }: OptionalLinkProps) {
  if (url === null) {
    return <span className={className}>{children}</span>;
  }
  return <a className={className} href={url} target="_blank" rel="noreferrer">{children}</a>;
}
```

- Después del `if (url === null) return`, TypeScript sabe que `url` es `string`. Es el mismo estrechamiento del apartado 3, sin escribir nada especial.
- `children` es lo que pones **entre** las etiquetas: en `<OptionalLink>hola</OptionalLink>`, `children` es `hola`.
- `rel="noreferrer"` va siempre con `target="_blank"`: impide que la página que abres pueda manipular la tuya.

**A qué se parece:** a un `Optional<String>` de Java, o a un `string?` de C#. El tipo te obliga a comprobar antes de usar.

### `DiscordButton`: ¿por qué es un `<a>` y no un `<button>`?

Se llama "botón" porque lo parece, pero **lleva a otra página**. La regla: si navega, es `<a>`; si ejecuta una acción sin salir de la página, es `<button>`. Así funcionan sin esfuerzo el clic central, "copiar dirección del enlace" y los lectores de pantalla.

### Pruébalo

En `data/links.ts`, cambia el `url: null` de GitHub por `url: "https://github.com"`. Ese ícono se vuelve clicable; los demás siguen igual.

---

## 9. El fondo animado: `MeshBackground.tsx` + `MeshRenderer.ts`

Es la parte más larga, pero la idea es simple.

### La división del trabajo

| Archivo | Sabe de | Hace |
|---|---|---|
| `MeshBackground.tsx` | React | Crea el `<canvas>`, arranca el renderer y lo destruye |
| `MeshRenderer.ts` | WebGL | Todo lo demás. No sabe que React existe |

```tsx
export function MeshBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const renderer = new MeshRenderer(canvas);
    renderer.start();
    return () => renderer.destroy();
  }, []);

  return <canvas ref={ref} className="mesh-background" aria-hidden="true" />;
}
```

- `useRef` es una **caja** donde React deja el elemento real del navegador. `ref.current` es el `<canvas>` de verdad, no su descripción en JSX.
- Es el mismo patrón del apartado 5: arrancar algo externo y devolver la limpieza. `start()` y `destroy()` son el `client.login()` y el `client.destroy()` de un bot.
- `if (!canvas) return;` es estrechar: `ref.current` es `HTMLCanvasElement | null`, y después de esa línea ya es `HTMLCanvasElement`.

### ¿Por qué una clase aparte y no todo dentro del componente?

Porque el fondo cambia **60 veces por segundo** (tiempo, scroll, puntero). Si eso viviera en `useState`, React volvería a ejecutar el componente 60 veces por segundo para nada. Regla: **lo que cambia en cada fotograma no va en estado**. Va en propiedades de una clase normal, que React ni mira.

Y aquí estás en casa: `MeshRenderer` es una clase como las de tu curso de POO, con campos privados, constructor y métodos.

### Qué hace un shader, en una frase

Un shader de fragmentos es **una función que se ejecuta una vez por cada pixel de la pantalla y devuelve su color**. La tarjeta gráfica ejecuta millones de copias a la vez.

Para cada pixel, el de este proyecto hace:

1. Calcula dónde está el pixel (`p`).
2. Mide lo cerca que está de cada una de las 5 manchas (`blob`): mucho en el centro, casi nada lejos.
3. Mezcla los colores según esas cercanías. La crema siempre pesa `1.0`, por eso domina.
4. Suma un poco de ruido (`hash`) para el grano.

Los **uniforms** (`u_time`, `u_scroll`, `u_c1`...) son los parámetros que JavaScript le pasa al shader. Son la única vía de comunicación entre los dos mundos.

### Nada de `null` sin comprobar

WebGL puede fallar en casi cada paso: navegador sin soporte, tarjeta gráfica bloqueada, shader que no compila. Por eso casi todo devuelve `algo | null`:

```ts
function createGLState(canvas: HTMLCanvasElement): GLState | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return null;
  // ...
}
```

Y en `start()`:

```ts
this.state = createGLState(this.canvas);
if (!this.state) return; // sin WebGL: se queda el degradado CSS de body
```

Si algo falla, la página no se rompe: el `<canvas>` se queda invisible y se ve el degradado que hay en `body` (en `global.css`). Eso es el **respaldo**.

### Los uniforms, tipados igual que las secciones

```ts
const UNIFORM_NAMES = ["u_res", "u_time", "u_scroll", /* ... */] as const;
type UniformName = (typeof UNIFORM_NAMES)[number];
type Uniforms = Record<UniformName, WebGLUniformLocation>;
```

Es **el mismo truco del apartado 3**: una lista `as const` y un tipo sacado de ella. `Record<UniformName, X>` significa "un objeto con una propiedad por cada nombre de la lista". Resultado: `uniforms.u_tiem` (mal escrito) no compila.

### Los manejadores son funciones flecha

```ts
private handleScroll = (): void => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  this.scrollTarget = max > 0 ? window.scrollY / max : 0;
};
```

Si fuera un método normal y se lo pasaras a `addEventListener`, al ejecutarse `this` ya no sería el renderer (en JavaScript, `this` depende de **quién llama** a la función, no de dónde se escribió). La función flecha se queda con el `this` del sitio donde se creó. Es la diferencia más traicionera con Java y C#, donde `this` siempre es el objeto.

### El suavizado

```ts
const k = 1 - Math.exp(-dt * SMOOTHING);
this.scroll += (this.scrollTarget - this.scroll) * k;
```

Hay dos valores: `scrollTarget` (dónde está el scroll de verdad) y `scroll` (lo que se le pasa al shader). En cada fotograma, `scroll` recorre **una parte** de la distancia que le falta. Así el fondo sigue al scroll con suavidad en vez de a saltos.

Ejemplo con `k = 0.5`, yendo de 0 a 100: `50 → 75 → 87.5 → 93.75...` Cada vez más cerca, cada vez más despacio.

`dt` es el tiempo desde el fotograma anterior. Usarlo hace que la velocidad sea la misma en una pantalla de 60 Hz que en una de 144 Hz.

### Los colores salen de los tokens

```ts
function readTokenColor(token: string, fallback: string): RGB {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token);
  return hexToRgb(value) ?? hexToRgb(fallback) ?? [1, 1, 1];
}
```

El shader no puede leer CSS, así que JavaScript lee la variable (`--primary`), la convierte de `#f9d56e` a tres números entre 0 y 1, y se los pasa. Por eso, en el "Pruébalo" del apartado 2, el fondo también cambiaba de color.

### Movimiento reducido

Si el sistema tiene activado "reducir movimiento", `handleMotionChange` dibuja **un solo fotograma** y no arranca el bucle. El fondo se ve igual, pero quieto.

### Pruébalo

En `MeshBackground.tsx`, cambia `new MeshRenderer(canvas)` por `new MeshRenderer(canvas, { speed: 4, grain: 0.15 })`. El fondo se mueve rápido y con mucho grano. Luego prueba `{ strength: 0 }`: desaparecen las manchas y queda solo la crema.

---

## 10. La animación hero → navbar (primera versión)

Está al final de `Hero.css`. No usa JavaScript.

```css
.hero-inner {
  animation: hero-to-navbar linear both;
  animation-timeline: scroll(root);
  animation-range: 0px 80vh;
}
```

Una animación normal avanza con el **tiempo**. Con `animation-timeline: scroll(root)` avanza con el **scroll**: al 0% del recorrido está en el primer fotograma, al 100% en el último, y si subes, retrocede. `animation-range` dice qué tramo del scroll cuenta: desde arriba del todo hasta haber bajado el 80% de una pantalla.

En ese tramo el bloque del hero se encoge hasta el tamaño del logo (`scale(0.376)`, que es 70px / 186px), se desplaza hacia la esquina y se desvanece. Justo ahí, el logo de verdad del navbar aparece. Los badges y el resto de textos se apagan antes, porque a esa escala no se leerían.

Tres protecciones:

- `@supports (animation-timeline: scroll())`: los navegadores que no lo entienden (Firefox, por ahora) se quedan sin animación, sin romperse.
- `prefers-reduced-motion: no-preference`: respeta a quien pidió menos movimiento.
- `min-width: 721px`: en móvil no hay logo en el navbar al que viajar.

Es una aproximación: el nombre va en dos líneas en el hero y en una en el navbar, así que no es una transformación exacta, sino un relevo con fundido. Si quieres el efecto fino, ese sería el momento de valorar GSAP.

---

## 11. Chuleta: los patrones que se repiten

| Patrón | Dónde | Para qué |
|---|---|---|
| Lista `as const` + `(typeof X)[number]` | `nav.ts`, `MeshRenderer.ts` | Un tipo que solo acepta los valores de la lista |
| Tipo de plantilla `` `#${sectionId}` `` | `nav.ts`, `Hero.tsx`, `Footer.tsx` | Un `href` mal escrito no compila |
| Guardia `value is T` | `nav.ts` | Convertir un `string` cualquiera en un tipo estrecho, comprobando |
| `T \| null` + `if` | `links.ts`, `MeshRenderer.ts` | Obligarte a pensar en el caso "no hay" |
| Datos en array + `.map` + `key` | Todas las listas | Agregar un elemento = agregar una línea de datos |
| Calcular en el render | `logoVisible` en `Navbar.tsx` | No guardar lo que se puede deducir |
| `useEffect` con limpieza | `useActiveSection.ts`, `MeshBackground.tsx` | Conectar con algo externo sin dejar basura |
| Clase fuera de React | `MeshRenderer.ts` | Lo que cambia cada fotograma no pasa por el estado |
| CSS colgado de atributos | `a[aria-current]`, `[data-visible]`, `[data-ready]` | El aspecto y el significado salen del mismo dato |
| `clamp()` y proporciones | Casi todos los `.css` | Responsive sin llenar todo de media queries |

Si entiendes esta tabla, entiendes el proyecto.
