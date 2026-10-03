import { DiscordButton } from "../components/DiscordButton";
import "./Contact.css";

export function Contact() {
  return (
    <section id="contacto" className="section" aria-labelledby="contacto-titulo">
      <div className="container section-inner">
        <h2 id="contacto-titulo" className="section-title">
          Contacto
        </h2>
        <p className="section-subtitle">¿Tienes alguna idea o quieres charlar?</p>

        <div className="contact-cta">
          <DiscordButton />
        </div>
      </div>
    </section>
  );
}
