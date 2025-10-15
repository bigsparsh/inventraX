
"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
	return (
		<Link href="/" aria-label="InventraX Home" className={cn("inline-flex items-center gap-2", className)}>
			<span
				aria-hidden
				className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/30"
			>
				<span className="absolute inset-0 animate-pulse rounded-md bg-primary/10" />
				<span className="h-3 w-3 rounded-sm bg-primary shadow-[0_0_0_2px_var(--color-background)]" />
			</span>
			<span className="font-semibold tracking-tight">InventraX</span>
		</Link>
	)
}
