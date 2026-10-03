import "./About.css";

type Service = {
  title: string;
  description: string;
};

const SERVICES: readonly Service[] = [
  {
    title: "Desarrollo Web",
    description:
      "Desarrollo full-stack de sitios web desde cero para cualquier tipo de producto, ya sean tiendas de Minecraft, portfolios, entre otros.",
  },
  {
    title: "Configuración de Discord",
    description:
      "Configuración completa de servidores de Discord. Bots existentes, canales, reglas de auto-moderación; todo lo necesario para que tu servidor luzca profesional y seguro.",
  },
  {
    title: "Desarrollo de Bots de Discord",
    description:
      "¿Sientes que ningún bot existente cumple con lo que buscas o simplemente no quieres tener 20 bots para cosas distintas? Puedo crear un bot personalizado para tu servidor que se ajuste a tus necesidades y gustos.",
  },
];

export function About() {
  return (
    <section id="sobre-mi" className="section" aria-labelledby="sobre-mi-titulo">
      <div className="container section-inner">
        <h2 id="sobre-mi-titulo" className="section-title">
          ¡Hola, soy Fosi!
        </h2>

        <div className="about-text section-subtitle">
          <p>
            Soy un desarrollador web y de bots de Discord con experiencia en el
            área.
          </p>
          <p>
            Con más de 4 años de experiencia, me dedico a hacer realidad las
            ideas para que vayan acorde al requerimiento del usuario. ¿Tienes
            una idea?
          </p>
          <p>Yo me encargo del resto.</p>
        </div>

        <div className="about-services">
          <hr className="divider" />
          <h3 className="about-services__title">¿Qué hago?</h3>
          <ul className="about-cards" role="list">
            {SERVICES.map(({ title, description }) => (
              <li key={title} className="about-card">
                <h4>{title}</h4>
                <p>{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
