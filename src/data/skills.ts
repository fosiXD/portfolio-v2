import discord from "../assets/icons/tech/discord.svg";
import discordjs from "../assets/icons/tech/discordjs.svg";
import dotnet from "../assets/icons/tech/dotnet.svg";
import java from "../assets/icons/tech/java.svg";
import javascript from "../assets/icons/tech/javascript.svg";
import kotlin from "../assets/icons/tech/kotlin.svg";
import linux from "../assets/icons/tech/linux.svg";
import mongodb from "../assets/icons/tech/mongodb.svg";
import nodejs from "../assets/icons/tech/nodejs.svg";
import proxmox from "../assets/icons/tech/proxmox.svg";
import python from "../assets/icons/tech/python.svg";
import react from "../assets/icons/tech/react.svg";
import typescript from "../assets/icons/tech/typescript.svg";

export type Skill = {
  id: string;
  name: string;
  /** URL del SVG (Vite la genera al importar el archivo) */
  icon: string;
};

// El orden es el del diseño: la cuadrícula parte sola en filas de 7 y 6
export const SKILLS: readonly Skill[] = [
  { id: "javascript", name: "JavaScript", icon: javascript },
  { id: "typescript", name: "TypeScript", icon: typescript },
  { id: "nodejs", name: "Node.js", icon: nodejs },
  { id: "python", name: "Python", icon: python },
  { id: "java", name: "Java", icon: java },
  { id: "kotlin", name: "Kotlin", icon: kotlin },
  { id: "dotnet", name: ".NET", icon: dotnet },
  { id: "react", name: "React", icon: react },
  { id: "mongodb", name: "MongoDB", icon: mongodb },
  { id: "linux", name: "Linux", icon: linux },
  { id: "proxmox", name: "Proxmox", icon: proxmox },
  { id: "discord", name: "Discord", icon: discord },
  { id: "discordjs", name: "discord.js", icon: discordjs },
];
