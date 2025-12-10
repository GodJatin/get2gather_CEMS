"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    className?: string;
}

export default function BackButton({ className }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={cn(
                "p-2 rounded-full hover:bg-white/10 transition-colors z-50",
                "border border-white/10 backdrop-blur-sm",
                "bg-black/20 text-white",
                className
            )}
            aria-label="Go back"
        >
            <ArrowLeft className="w-6 h-6" />
        </button>
    );
}
