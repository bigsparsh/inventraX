"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])

	const isDark = (resolvedTheme ?? theme) === "dark"
	return (
		<div className="flex items-center gap-2">
			<Switch
				aria-label="Toggle dark mode"
				checked={mounted ? isDark : false}
				onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
			/>
			<Label className="text-xs text-muted-foreground select-none">
				{mounted ? (isDark ? "Dark" : "Light") : "Theme"}
			</Label>
		</div>
	)
}
