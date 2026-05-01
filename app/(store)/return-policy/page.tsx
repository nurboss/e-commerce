export default function ReturnPolicyPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-12">
      <h1 className="text-3xl font-semibold">Return Policy</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Eligible products can be returned within 7 days of delivery in unused condition with
        original packaging.
      </p>
      <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        <p>Open the related order from your account and submit a return request.</p>
        <p>Our support team reviews requests and confirms pickup/replacement eligibility.</p>
        <p>Refunds are processed to original payment method or as store credit based on policy.</p>
        <p>Non-returnable items include perishables, personal care, and custom-made products.</p>
      </div>
    </section>
  );
}
