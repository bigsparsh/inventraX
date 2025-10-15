import { SiteHeader } from "@/components/site-header"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
	return (
		<main>
			<SiteHeader />
			<section className="py-16">
				<div className="mx-auto max-w-md px-4">
					<h1 className="text-2xl font-semibold">Create your account</h1>
					<p className="mt-1 text-sm text-muted-foreground">Join InventraX and invite your team.</p>
					<div className="mt-6 rounded-xl border bg-card p-6">
						<SignupForm />
					</div>
				</div>
			</section>
		</main>
	)
}
