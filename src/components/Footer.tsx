import { COLLABS, SOCIALS } from "../data/links";
import { NAV, type sectionId } from "../data/nav";
import { OptionalLink } from "./OptionalLink";
import "./Footer.css";

type SectionHref = `#${sectionId}`;

// El footer sí enlaza a "inicio", que no está en el menú del navbar
const FOOTER_NAV: readonly { label: string; href: SectionHref }[] = [
  { label: "Inicio", href: "#inicio" },
  ...NAV,
];

const SERVICES = [
  "Desarrollo Web",
  "Configuración de Discord",
  "Desarrollo de Bots",
] as const;
// Los servicios se explican en las tarjetas de "Sobre Mí"
const SERVICES_HREF: SectionHref = "#sobre-mi";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-columns">
          <div className="footer-brand">
            <p className="footer-brand__name">&lt;OnlyFosi /&gt;</p>
            <ul className="footer-socials" role="list">
              {SOCIALS.map(({ label, icon, url }) => (
                <li key={label}>
                  <OptionalLink url={url} label={label}>
                    <img src={icon} width={24} height={24} alt="" />
                  </OptionalLink>
                </li>
              ))}
            </ul>
          </div>

          <nav className="footer-section" aria-labelledby="footer-navegacion">
            <h2 id="footer-navegacion">Navegación</h2>
            <ul role="list">
              {FOOTER_NAV.map(({ label, href }) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-section">
            <h2>Servicios</h2>
            <ul role="list">
              {SERVICES.map((service) => (
                <li key={service}>
                  <a href={SERVICES_HREF}>{service}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h2>Colaboraciones</h2>
            <ul role="list">
              {COLLABS.map(({ label, url }) => (
                <li key={label}>
                  <OptionalLink url={url}>{label}</OptionalLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="divider" />
        <p className="footer-copyright">
          © 2026 OnlyFosi. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
