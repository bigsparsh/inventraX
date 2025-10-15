import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-40 w-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
			<div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
				<Logo />
				<nav className="hidden md:flex items-center gap-6 text-sm">
					<Link href="#features" className="relative hover:text-primary transition-colors">
						<span className="after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-[width] after:duration-200 hover:after:w-full">
							Features
						</span>
					</Link>
					<Link href="#stats" className="relative hover:text-primary transition-colors">
						<span className="after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-[width] after:duration-200 hover:after:w-full">
							Stats
						</span>
					</Link>
					<Link href="#get-started" className="relative hover:text-primary transition-colors">
						<span className="after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-[width] after:duration-200 hover:after:w-full">
							Get started
						</span>
					</Link>
				</nav>
				<div className="flex items-center gap-3">
					{/* Theme toggle */}
					<ThemeToggle />
					<Button asChild variant="ghost">
						<Link href="/login">Log in</Link>
					</Button>
					<Button asChild>
						<Link href="/register">Sign up</Link>
					</Button>
				</div>
			</div>
		</header>
	)
}
