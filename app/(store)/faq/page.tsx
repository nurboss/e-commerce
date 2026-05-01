const faqItems = [
  {
    question: "How long does delivery take?",
    answer: "Standard delivery in Bangladesh usually takes 2 to 5 business days.",
  },
  {
    question: "Can I place Cash on Delivery orders?",
    answer: "Yes, Cash on Delivery is available for eligible areas.",
  },
  {
    question: "How can I request a return?",
    answer: "Open your order details from account dashboard and submit a return request.",
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Frequently Asked Questions</h1>
      <div className="mt-6 space-y-3">
        {faqItems.map((item) => (
          <details key={item.question} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <summary className="cursor-pointer font-medium">{item.question}</summary>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
