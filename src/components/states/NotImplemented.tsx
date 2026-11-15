import { Link } from "react-router-dom";

type NotImplementedProps = {
  title: string;
  description: string;
};

export function NotImplemented({ title, description }: NotImplementedProps) {
  return (
    <section className="max-w-[68ch]">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-4 text-base font-medium text-foreground">
        Este módulo no está implementado.
      </p>
      <p className="mt-2 text-base text-muted-foreground">{description}</p>
      <p className="mt-6">
        <Link
          to="/"
          className="text-sm font-medium text-primary-ink underline decoration-primary-ink/40 underline-offset-4"
        >
          Volver al inicio
        </Link>
      </p>
    </section>
  );
}
