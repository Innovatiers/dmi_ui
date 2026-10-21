import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
}

/** Accessible button; defaults to `type="button"` so it never submits a form by accident. */
export function Button({ variant = 'primary', type = 'button', className, ...rest }: ButtonProps) {
  const classes = ['cw-button', `cw-button--${variant}`, className].filter(Boolean).join(' ');
  return <button type={type} className={classes} {...rest} />;
}
