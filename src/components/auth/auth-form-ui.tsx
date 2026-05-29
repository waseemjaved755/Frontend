import Link from "next/link";
import type { InputHTMLAttributes, ReactNode } from "react";

type AuthFieldProps = {
  label: string;
  children: ReactNode;
};

export function AuthField({ label, children }: AuthFieldProps) {
  return (
    <label className="block text-sm font-medium text-zinc-300">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

type AuthInputProps = InputHTMLAttributes<HTMLInputElement>;

export function AuthInput(props: AuthInputProps) {
  return <input {...props} className={`input-glass ${props.className ?? ""}`.trim()} />;
}

export function AuthError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {message}
    </p>
  );
}

export function AuthSuccess({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
      {message}
    </p>
  );
}

type AuthFooterLinkProps = {
  text: string;
  linkText: string;
  href: string;
};

export function AuthFooterLink({ text, linkText, href }: AuthFooterLinkProps) {
  return (
    <p className="mt-5 text-center text-sm text-zinc-500">
      {text}{" "}
      <Link href={href} className="font-medium text-sky-400 hover:text-sky-300">
        {linkText}
      </Link>
    </p>
  );
}
