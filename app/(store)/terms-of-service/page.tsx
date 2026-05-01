export default function TermsOfServicePage() {
  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-12">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        By using this storefront, you agree to our ordering, payment, shipping, and return terms.
      </p>
      <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        <p>Orders are confirmed only after successful payment authorization or COD verification.</p>
        <p>Delivery timelines are estimates and may vary by destination and courier conditions.</p>
        <p>Promotions and coupons can be updated, limited, or revoked without prior notice.</p>
        <p>Account misuse, fraud, or abusive behavior may lead to access suspension.</p>
      </div>
    </section>
  );
}
