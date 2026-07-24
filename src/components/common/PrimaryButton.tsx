import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}