import { SiteHeader } from "@/components/site-header"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
	return (
		<main>
			<SiteHeader />
			<section className="py-16">
				<div className="mx-auto max-w-md px-4">
					<h1 className="text-2xl font-semibold">Log in</h1>
					<p className="mt-1 text-sm text-muted-foreground">Welcome back to InventraX.</p>
					<div className="mt-6 rounded-xl border bg-card p-6">
						<LoginForm />
					</div>
				</div>
			</section>
		</main>
	)
}
