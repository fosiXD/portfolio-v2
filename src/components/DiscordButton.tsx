import discordIcon from "../assets/icons/ui/discord-button.svg";
import { DISCORD_INVITE } from "../data/links";
import { OptionalLink } from "./OptionalLink";
import "./DiscordButton.css";

// Es un enlace y no un <button>: lleva a otra página en lugar de ejecutar una acción
export function DiscordButton() {
  return (
    <OptionalLink className="discord-button" url={DISCORD_INVITE}>
      <img src={discordIcon} width={48} height={48} alt="" />
      Únete a la comunidad
    </OptionalLink>
  );
}
