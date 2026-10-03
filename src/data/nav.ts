export const SECTIONS = ["inicio", "sobre-mi", "habilidades", "contacto"] as const;
export type sectionId = (typeof SECTIONS)[number];

export type NavLink = {
    id: sectionId;
    label: string;
    href: `#${sectionId}`;
}

export const NAV: readonly NavLink[] = [
    { id: 'sobre-mi', label: 'Sobre Mí', href: '#sobre-mi' },
    { id: 'habilidades', label: 'Habilidades', href: '#habilidades' },
    { id: 'contacto', label: 'Contacto', href: '#contacto' },
]

export const isSectionId = (value: string): value is sectionId =>
  (SECTIONS as readonly string[]).includes(value);