import { SKILLS } from "../data/skills";
import "./Skills.css";

export function Skills() {
  return (
    <section id="habilidades" className="section" aria-labelledby="habilidades-titulo">
      <div className="container section-inner">
        <h2 id="habilidades-titulo" className="section-title">
          Habilidades
        </h2>
        <p className="section-subtitle">
          Estas son las tecnologías que trabajo a diario.
        </p>

        <div className="skills-content">
          <hr className="divider" />
          <ul className="skills-grid" role="list">
            {SKILLS.map(({ id, name, icon }) => (
              <li key={id} className="skill">
                {/* alt vacío: el nombre ya está escrito debajo */}
                <img src={icon} width={48} height={48} alt="" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
