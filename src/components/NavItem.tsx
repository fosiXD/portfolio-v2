import type { NavLink } from "../data/nav";
import "./NavItem.css";

export type NavItemEstado = "normal" | "seleccionado";

type NavItemProps = Pick<NavLink, "label" | "href"> & {
  estado?: NavItemEstado;
};

export function NavItem({ label, href, estado = "normal" }: NavItemProps) {
  return (
    <li className="nav-item">
      <a
        href={href}
        aria-current={estado === "seleccionado" ? "location" : undefined}
      >
        {label}
      </a>
    </li>
  );
}
