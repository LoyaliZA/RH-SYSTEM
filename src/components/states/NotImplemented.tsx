type NotImplementedProps = {
  title: string;
  description: string;
};

export function NotImplemented({ title, description }: NotImplementedProps) {
  return (
    <section className="max-w-prose">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-base font-medium text-foreground">
        Este módulo no está implementado.
      </p>
      <p className="mt-2 text-base text-muted-foreground">{description}</p>
    </section>
  );
}
