export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-12">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        We collect customer information to process orders, provide support, and improve platform
        performance.
      </p>
      <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        <p>We store account profile details, order history, and shipping addresses securely.</p>
        <p>Payment credentials are handled by payment gateways and not stored on our servers.</p>
        <p>Cookie data is used for session continuity, personalization, and analytics.</p>
        <p>You can request data correction or account deletion through account settings and support.</p>
      </div>
    </section>
  );
}
