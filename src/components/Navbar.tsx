import avatar from "../assets/avatar.webp";
import { NAV } from "../data/nav";
import { useActiveSection } from "../hooks/useActiveSection";
import { NavItem } from "./NavItem";
import "./Navbar.css";

type NavbarProps = {
  /** true: siempre; false: nunca. Si se omite, aparece al salir del hero. */
  showLogo?: boolean;
};

export function Navbar({ showLogo }: NavbarProps) {
  const active = useActiveSection();
  const logoVisible = showLogo ?? active !== "inicio";

  return (
    <header className="navbar">
      {/* Siempre montado: el CSS lo oculta con data-visible para poder animarlo */}
      <a
        className="navbar-logo"
        href="#inicio"
        data-visible={logoVisible}
        aria-label="Only Fosi, ir al inicio"
      >
        <img src={avatar} width={70} height={70} alt="" />
        <span className="navbar-logo__name">&lt;OnlyFosi /&gt;</span>
      </a>

      <nav aria-label="Principal">
        <ul className="navbar-list" role="list">
          {NAV.map(({ id, label, href }) => (
            <NavItem
              key={id}
              label={label}
              href={href}
              estado={active === id ? "seleccionado" : "normal"}
            />
          ))}
        </ul>
      </nav>
    </header>
  );
}
