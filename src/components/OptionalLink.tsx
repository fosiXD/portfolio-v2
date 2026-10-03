import type { ReactNode } from "react";

type OptionalLinkProps = {
  /** null = todavía no hay URL: se pinta un <span> en vez de un enlace roto */
  url: string | null;
  className?: string;
  /** Nombre accesible, para enlaces que solo tienen un ícono */
  label?: string;
  children: ReactNode;
};

export function OptionalLink({ url, className, label, children }: OptionalLinkProps) {
  if (url === null) {
    return (
      <span className={className} aria-label={label} role={label ? "img" : undefined}>
        {children}
      </span>
    );
  }

  return (
    <a className={className} href={url} target="_blank" rel="noreferrer" aria-label={label}>
      {children}
    </a>
  );
}
