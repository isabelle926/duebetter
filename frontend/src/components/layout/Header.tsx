export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-x1 bg-indigo-600 font-bold text-white">
                    D
                </div>

                <h1 className="text-x1 font-semibold tracking-tight text-slate-900">
                    DueBetter
                </h1>
            </div>

            <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                aria-label="Open profile"
            >
                U
            </button>
        </header>
    );
}