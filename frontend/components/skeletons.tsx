import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 h-40 flex flex-col justify-between">
                    <div>
                        <Skeleton className="h-4 w-24 mb-3 bg-neutral-800" />
                        <Skeleton className="h-10 w-16 bg-neutral-800" />
                    </div>
                    <Skeleton className="h-3 w-32 bg-neutral-800/50" />
                </div>
            ))}
        </div>
    );
}

export function BookingCardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
                <div key={i} className="p-6 rounded-3xl bg-neutral-900/30 border border-white/5 h-64 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <Skeleton className="h-8 w-3/4 bg-neutral-800" />
                        <Skeleton className="h-6 w-20 rounded-full bg-neutral-800" />
                    </div>
                    <div className="space-y-3 mb-8">
                        <Skeleton className="h-4 w-40 bg-neutral-800" />
                        <Skeleton className="h-4 w-32 bg-neutral-800" />
                    </div>
                    <div className="flex gap-3 mt-auto">
                        <Skeleton className="h-10 flex-1 rounded-xl bg-neutral-800" />
                        <Skeleton className="h-10 w-32 rounded-xl bg-neutral-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function StudentDashboardSkeleton() {
    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Hero Skeleton */}
            <div className="mb-8 p-8 md:p-12 rounded-3xl border border-white/10 bg-neutral-900/30">
                <Skeleton className="h-12 w-2/3 md:w-1/2 mb-4 bg-neutral-800" />
                <Skeleton className="h-6 w-full md:w-3/4 bg-neutral-800/50" />
            </div>

            <DashboardStatsSkeleton />
            
            <div className="mb-6 flex justify-between items-center">
                <Skeleton className="h-8 w-48 bg-neutral-800" />
                <Skeleton className="h-4 w-20 bg-neutral-800" />
            </div>
            
            <BookingCardSkeleton />
        </div>
    );
}

export function EventCardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-3xl border border-white/5 bg-neutral-900/50 overflow-hidden h-[450px] flex flex-col">
                    <Skeleton className="h-48 w-full bg-neutral-800" />
                    <div className="p-6 flex-1 flex flex-col">
                        <Skeleton className="h-4 w-24 mb-2 bg-neutral-800" />
                        <Skeleton className="h-8 w-full mb-4 bg-neutral-800" />
                        <div className="space-y-2 mb-6">
                            <Skeleton className="h-4 w-3/4 bg-neutral-800/50" />
                            <Skeleton className="h-4 w-1/2 bg-neutral-800/50" />
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                            <Skeleton className="h-10 w-32 rounded-xl bg-neutral-800" />
                            <Skeleton className="h-4 w-24 bg-neutral-800/50" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
             {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
                    <Skeleton className="h-12 w-12 rounded-full bg-neutral-800" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3 bg-neutral-800" />
                        <Skeleton className="h-3 w-1/4 bg-neutral-800/50" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg bg-neutral-800" />
                </div>
             ))}
        </div>
    );
}
