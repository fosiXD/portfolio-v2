import { useEffect, useState } from "react";
import { SECTIONS, type sectionId } from "../data/nav";

/** Línea de referencia: al 20% de la pantalla, contando desde arriba */
const LINE = 0.2;

/** La sección activa es la última cuyo borde superior ya pasó la línea */
function findActiveSection(): sectionId {
  const line = window.innerHeight * LINE;
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;

  let active: sectionId = SECTIONS[0];
  let activeTop = -Infinity;
  let lowest: sectionId = SECTIONS[0];
  let lowestTop = -Infinity;

  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;

    if (top <= line && top > activeTop) {
      active = id;
      activeTop = top;
    }
    if (top > lowestTop) {
      lowest = id;
      lowestTop = top;
    }
  }

  // Al final de la página la última sección puede ser tan corta que nunca
  // llega a la línea: ahí gana siempre la de más abajo.
  return atBottom ? lowest : active;
}

export function useActiveSection(): sectionId {
  const [active, setActive] = useState<sectionId>(SECTIONS[0]);

  useEffect(() => {
    // Si el valor no cambia, React no vuelve a pintar: llamar en cada scroll es barato
    const update = () => setActive(findActiveSection());

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return active;
}
