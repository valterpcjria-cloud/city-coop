/**
 * Streaming skeleton loader for Gestor dashboard pages.
 * Provides instant visual feedback while Server Components fetch data.
 */
export default function GestorLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Page Header Skeleton */}
            <div className="flex flex-col gap-2">
                <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-5 w-96 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl"
                    />
                ))}
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8 h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                <div className="lg:col-span-4 h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            </div>
        </div>
    )
}
