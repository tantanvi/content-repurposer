import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">登录</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        输入邮箱，我们会发一封登录链接给你。
      </p>
      <form
        action={async (formData) => {
          "use server";
          await signIn("nodemailer", { email: formData.get("email"), redirectTo: "/" });
        }}
        className="mt-6 flex flex-col gap-3"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          发送登录链接
        </button>
      </form>
    </div>
  );
}
