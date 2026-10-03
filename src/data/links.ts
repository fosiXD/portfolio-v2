import discord from "../assets/icons/social/discord.svg";
import github from "../assets/icons/social/github.svg";
import instagram from "../assets/icons/social/instagram.svg";
import twitch from "../assets/icons/social/twitch.svg";
import x from "../assets/icons/social/x.svg";
import youtube from "../assets/icons/social/youtube.svg";

// ─────────────────────────────────────────────────────────────────────
// TODO(Fosi): pega aquí tus enlaces, entre comillas, en lugar de null.
//   Ejemplo:  url: "https://github.com/tu-usuario"
// Mientras un enlace sea null, el elemento se ve igual pero no es clicable.
// ─────────────────────────────────────────────────────────────────────

/** Invitación al servidor de Discord (botón de Contacto e ícono del footer) */
export const DISCORD_INVITE: string | null = "https://discord.gg/tCAPfTzdsR";

export type ExternalLink = {
  label: string;
  url: string | null;
};

export type SocialLink = ExternalLink & {
  icon: string;
};

export const SOCIALS: readonly SocialLink[] = [
  { label: "GitHub", icon: github, url: "https://github.com/fosiXD" },
  { label: "Discord", icon: discord, url: DISCORD_INVITE },
  { label: "X", icon: x, url: "https://x.com/OnlyFosi_" },
  { label: "Instagram", icon: instagram, url: "https://www.instagram.com/onlyfosi_/" },
  { label: "Twitch", icon: twitch, url: "https://www.twitch.tv/onlyfosi_" },
  { label: "YouTube", icon: youtube, url: "https://www.youtube.com/@onlyfosi" },
];

export const COLLABS: readonly ExternalLink[] = [
  { label: "Builder’s Academy", url: "https://discord.gg/JQj7BJ2MRZ" },
  { label: "Academy Studios", url: "https://discord.gg/rEftK9WNDe" },
];
