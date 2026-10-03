import avatar from "../assets/avatar.webp";
import arrow from "../assets/icons/ui/arrow-drop-down.svg";
import type { sectionId } from "../data/nav";
import "./Hero.css";

const PROFESSIONS = [
  "Full-Stack Web Development",
  "Discord Config & Bot Development",
] as const;
const STATS = ["+4 Años", "+50 Proyectos"] as const;
const CTA_HREF: `#${sectionId}` = "#sobre-mi";

export function Hero() {
  const [left, right] = PROFESSIONS;

  return (
    <section id="inicio" className="hero">
      <div className="hero-inner">
        <img
          className="hero-avatar"
          src={avatar}
          width={186}
          height={186}
          alt="Retrato en pixel art de Only Fosi"
        />

        <h1
          className="hero-name"
          aria-label="Only Fosi, Full-Stack Developer y Discord Bot Developer"
        >
          <span className="hero-row hero-row--top" aria-hidden="true">
            <span>&lt;Only</span>
            <span className="hero-badge">Full-Stack Developer</span>
          </span>
          <span className="hero-row hero-row--bottom" aria-hidden="true">
            <span className="hero-badge">Discord Bot Developer</span>
            <span>Fosi /&gt;</span>
          </span>
        </h1>

        <p className="hero-profession hero-detail">
          <span className="hero-profession__left">{left}</span>
          <span className="hero-profession__dot" aria-hidden="true">
            ·
          </span>
          <span className="hero-profession__right">{right}</span>
        </p>

        <ul className="hero-stats hero-detail" role="list">
          {STATS.map((stat) => (
            <li key={stat}>{stat}</li>
          ))}
        </ul>

        <a href={CTA_HREF} className="hero-cta hero-detail">
          <img src={arrow} width={24} height={24} alt="" />
          Sobre Mí
          <img src={arrow} width={24} height={24} alt="" />
        </a>
      </div>
    </section>
  );
}
