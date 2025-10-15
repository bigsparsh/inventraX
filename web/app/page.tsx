"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"

// Inline helpers for tilt and parallax
function useParallax() {
	const ref = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		const el = ref.current
		if (!el) return
		const onMove = (e: MouseEvent) => {
			const rect = el.getBoundingClientRect()
			const x = e.clientX - rect.left - rect.width / 2
			const y = e.clientY - rect.top - rect.height / 2
			el.style.setProperty("--p-x", `${-(x / rect.width) * 6}deg`)
			el.style.setProperty("--p-y", `${(y / rect.height) * 6}deg`)
		}
		el.addEventListener("mousemove", onMove)
		el.addEventListener("mouseleave", () => {
			el.style.setProperty("--p-x", "0deg")
			el.style.setProperty("--p-y", "0deg")
		})
		return () => {
			el.removeEventListener("mousemove", onMove)
		}
	}, [])
	return ref
}

function useCountUp(target: number, duration = 1200) {
	const [value, setValue] = useState(0)
	const ref = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		const el = ref.current
		if (!el) return
		let started = false
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !started) {
						started = true
						const start = performance.now()
						const tick = (now: number) => {
							const t = Math.min(1, (now - start) / duration)
							setValue(Math.floor(target * (1 - Math.pow(1 - t, 3))))
							if (t < 1) requestAnimationFrame(tick)
						}
						requestAnimationFrame(tick)
					}
				})
			},
			{ threshold: 0.4 },
		)
		io.observe(el)
		return () => io.disconnect()
	}, [target, duration])
	return { ref, value }
}

export default function Page() {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])
	const isDark = (resolvedTheme ?? theme) === "dark"

	const heroRef = useParallax()

	const stat1 = useCountUp(1200)
	const stat2 = useCountUp(99)
	const stat3 = useCountUp(24)

	return (
		<main>
			{/* Header */}
			<header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
					<Link href="/" className="font-semibold tracking-tight">
						InventraX
					</Link>
					<nav className="hidden md:flex items-center gap-6 text-sm">
						<a href="#features" className="relative hover:text-primary transition-colors">
							<span className="after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-[width] after:duration-200 hover:after:w-full">
								Features
							</span>
						</a>
						<a href="#stats" className="relative hover:text-primary transition-colors">
							<span className="after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-[width] after:duration-200 hover:after:w-full">
								Stats
							</span>
						</a>
						<a href="#get-started" className="relative hover:text-primary transition-colors">
							<span className="after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-[width] after:duration-200 hover:after:w-full">
								Get started
							</span>
						</a>
					</nav>
					<div className="flex items-center gap-3">
						{/* Inline theme toggle for landing page */}
						<div className="flex items-center gap-2">
							<Switch
								aria-label="Toggle dark mode"
								checked={mounted ? isDark : false}
								onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
							/>
							<span className="text-xs text-muted-foreground">{mounted ? (isDark ? "Dark" : "Light") : "Theme"}</span>
						</div>
						<Button asChild variant="ghost">
							<Link href="/login">Log in</Link>
						</Button>
						<Button asChild>
							<Link href="/register">Sign up</Link>
						</Button>
					</div>
				</div>
			</header>

			{/* Hero */}
			<section ref={heroRef} className="relative overflow-hidden">
				<div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
					<div className="grid items-center gap-10 md:grid-cols-2">
						<div>
							<h1 className="text-balance text-4xl md:text-5xl font-semibold leading-tight">
								Minimal inventory control with maximum clarity
							</h1>
							<p className="mt-3 text-pretty text-muted-foreground">
								InventraX keeps your stock, orders, and locations in sync — in real time. Built for teams that value
								speed, accuracy, and simplicity.
							</p>
							<div className="mt-6 flex items-center gap-3">
								<Button asChild>
									<Link href="/signup">Get started</Link>
								</Button>
								<Button variant="outline" asChild>
									<a href="#features">Explore features</a>
								</Button>
							</div>
							<div className="mt-8 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
								<div className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-primary" />
									Real-time updates
								</div>
								<div className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-accent" />
									Role-based access
								</div>
							</div>
						</div>

						{/* Interactive Preview Card */}
						<div
							className="relative rounded-xl border bg-card p-4 md:p-6 will-change-transform transition-transform"
							style={{
								transform: "perspective(1000px) rotateX(var(--p-y, 0deg)) rotateY(var(--p-x, 0deg))",
							}}
						>
							<div className="rounded-lg border bg-background p-4">
								<div className="flex items-center justify-between">
									<div className="text-sm font-medium">Warehouse A</div>
									<div className="text-xs text-muted-foreground">Synced</div>
								</div>
								<div className="mt-4 grid grid-cols-3 gap-2">
									<div className="rounded-md border p-3 hover:shadow-sm transition-shadow">
										<div className="text-xs text-muted-foreground">SKU</div>
										<div className="font-mono text-sm">INV-1024</div>
									</div>
									<div className="rounded-md border p-3 hover:shadow-sm transition-shadow">
										<div className="text-xs text-muted-foreground">In Stock</div>
										<div className="font-semibold">864</div>
									</div>
									<div className="rounded-md border p-3 hover:shadow-sm transition-shadow">
										<div className="text-xs text-muted-foreground">Reorder</div>
										<div className="font-semibold">Yes</div>
									</div>
								</div>
								<div className="mt-4 rounded-md border p-4">
									<img
										className="w-full rounded-md"
										alt="Inventory dashboard preview"
										src="/clean-inventory-dashboard.jpg"
									/>
								</div>
							</div>
							{/* Floating accents */}
							<div className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-xl border bg-background/80 backdrop-blur-sm" />
							<div className="pointer-events-none absolute -bottom-5 -left-5 h-12 w-12 rounded-lg bg-primary/10" />
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section id="features" className="py-16 md:py-20">
				<div className="mx-auto max-w-6xl px-4">
					<h2 className="text-2xl md:text-3xl font-semibold">What makes InventraX different</h2>
					<p className="mt-2 text-muted-foreground">Purposefully minimal, delightfully fast, designed for teams.</p>

					<div className="mt-8 grid gap-4 md:grid-cols-3">
						{[
							{ title: "Live Stock", desc: "Always know what's on hand, on order, and allocated." },
							{ title: "Multi-location", desc: "Track across warehouses, stores, and vendors seamlessly." },
							{ title: "Automation", desc: "Set thresholds and let InventraX create tasks for you." },
						].map((f, i) => (
							<div
								key={i}
								onMouseMove={(e) => {
									const el = e.currentTarget as HTMLDivElement
									const rect = el.getBoundingClientRect()
									const x = e.clientX - rect.left - rect.width / 2
									const y = e.clientY - rect.top - rect.height / 2
									el.style.setProperty("--rx", `${(y / rect.height) * -6}deg`)
									el.style.setProperty("--ry", `${(x / rect.width) * 6}deg`)
								}}
								onMouseLeave={(e) => {
									const el = e.currentTarget as HTMLDivElement
									el.style.setProperty("--rx", `0deg`)
									el.style.setProperty("--ry", `0deg`)
								}}
								className="group relative rounded-xl border bg-card p-6 transition-transform will-change-transform"
								style={{
									transform: "perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
								}}
							>
								<div className="flex items-center justify-between">
									<div className="text-base font-medium">{f.title}</div>
									<span className="h-2 w-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
								</div>
								<p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
								<div className="mt-4 h-28 rounded-lg border bg-background" />
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Stats */}
			<section id="stats" className="py-12 md:py-16">
				<div className="mx-auto max-w-6xl px-4 grid gap-6 md:grid-cols-3">
					<div ref={stat1.ref} className="rounded-xl border bg-card p-6 text-center">
						<div className="text-3xl font-semibold">{stat1.value.toLocaleString()}</div>
						<div className="mt-1 text-sm text-muted-foreground">Products tracked</div>
					</div>
					<div ref={stat2.ref} className="rounded-xl border bg-card p-6 text-center">
						<div className="text-3xl font-semibold">{stat2.value}%</div>
						<div className="mt-1 text-sm text-muted-foreground">Accuracy rate</div>
					</div>
					<div ref={stat3.ref} className="rounded-xl border bg-card p-6 text-center">
						<div className="text-3xl font-semibold">{stat3.value}/7</div>
						<div className="mt-1 text-sm text-muted-foreground">Support availability</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section id="get-started" className="py-16 md:py-20">
				<div className="mx-auto max-w-6xl px-4">
					<div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-10 text-center">
						<h3 className="text-2xl font-semibold">Ready to simplify your inventory?</h3>
						<p className="mt-2 max-w-xl text-pretty text-muted-foreground">
							Start your free trial today and invite your team. No credit card required.
						</p>
						<div className="mt-6 flex items-center gap-3">
							<Button asChild>
								<Link href="/signup">Create account</Link>
							</Button>
							<Button variant="outline" asChild>
								<a href="#features">See how it works</a>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<footer className="border-t">
				<div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground flex items-center justify-between">
					<span>© {new Date().getFullYear()} InventraX</span>
					<div className="flex items-center gap-6">
						<a href="#features" className="hover:text-foreground">
							Features
						</a>
						<a href="#stats" className="hover:text-foreground">
							Stats
						</a>
						<Link href="/login" className="hover:text-foreground">
							Login
						</Link>
					</div>
				</div>
			</footer>
		</main>
	)
}
