type PagePlaceholderProps = {
  title: string;
  description: string;
};

export const PagePlaceholder = ({ title, description }: PagePlaceholderProps) => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{description}</p>
    </section>
  );
};
