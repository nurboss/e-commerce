"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });
    if (result?.ok) {
      router.push("/account");
      return;
    }
    form.setError("root", { message: "Invalid email or password." });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 space-y-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
      >
        <input
          type="email"
          placeholder="Email"
          {...form.register("email")}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          type="password"
          placeholder="Password"
          {...form.register("password")}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {form.formState.errors.root?.message ? (
          <p className="text-sm text-red-500">{form.formState.errors.root.message}</p>
        ) : null}
        <button className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900">
          Sign in
        </button>
      </form>
    </div>
  );
}
