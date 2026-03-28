type AdminLoginSectionProps = {
    error: string;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    submitting: boolean;
    username: string;
};

export function AdminLoginSection({
    error,
    onSubmit,
    password,
    setPassword,
    setUsername,
    submitting,
    username,
}: AdminLoginSectionProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Admin Access</div>
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                    管理员登录
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    登录后才能访问文章、分类和标签管理接口。
                </p>

                {error ? (
                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {error}
                    </div>
                ) : null}

                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            用户名
                        </span>
                        <input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            autoComplete="username"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            密码
                        </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white disabled:opacity-60"
                    >
                        {submitting ? "登录中..." : "登录"}
                    </button>
                </form>
            </section>
        </div>
    );
}
