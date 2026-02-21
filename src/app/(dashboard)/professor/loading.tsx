/**
 * Streaming skeleton loader for Professor dashboard pages.
 * Provides instant visual feedback while Server Components fetch data.
 */
export default function ProfessorLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Page Header Skeleton */}
            <div className="flex flex-col gap-2">
                <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-5 w-80 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl"
                    />
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
    )
}
