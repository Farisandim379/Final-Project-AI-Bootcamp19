import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "ghost" | "dark";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  ghost: "btn--ghost",
  dark: "btn--dark",
};

interface SharedProps {
  variant?: ButtonVariant;
  /** Ikon dirender setelah label. */
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

interface ButtonAsLinkProps extends SharedProps {
  href: string;
  external?: boolean;
}

interface ButtonAsButtonProps
  extends SharedProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  href?: undefined;
}

function classNames(variant: ButtonVariant, extra?: string): string {
  return ["btn", VARIANT_CLASS[variant], extra].filter(Boolean).join(" ");
}

export function Button(props: ButtonAsLinkProps | ButtonAsButtonProps) {
  const { variant = "primary", icon, className, children } = props;
  const cls = classNames(variant, className);

  if (props.href !== undefined) {
    const external = props.external ?? props.href.startsWith("http");
    return (
      <a
        className={cls}
        href={props.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      >
        <span>{children}</span>
        {icon}
      </a>
    );
  }

  const { variant: _v, icon: _i, className: _c, children: _ch, ...rest } = props;
  void _v;
  void _i;
  void _c;
  void _ch;

  return (
    <button className={cls} {...rest}>
      <span>{children}</span>
      {icon}
    </button>
  );
}
