"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export function SignupForm() {
	const router = useRouter()
	const { register } = useAuth()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		setLoading(true)
		
		const form = new FormData(e.currentTarget)
		const payload = {
			email: String(form.get("email") || ""),
			name: String(form.get("name") || ""),
			dob: String(form.get("dob") || ""),
			role: String(form.get("role") || "STAFF") as 'ADMIN' | 'MANAGER' | 'STAFF',
			password: String(form.get("password") || ""),
		}
		
		try {
			await register(payload)
			// Redirect to dashboard on successful registration
			router.push('/dashboard')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Registration failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={onSubmit} className="grid gap-4">
			<div className="grid gap-2">
				<Label htmlFor="email">Email</Label>
				<Input id="email" name="email" type="email" required placeholder="you@company.com" />
			</div>
			<div className="grid gap-2">
				<Label htmlFor="name">Full name</Label>
				<Input id="name" name="name" type="text" required placeholder="Jamie Appleseed" />
			</div>
			<div className="grid gap-2">
				<Label htmlFor="dob">Date of birth</Label>
				<Input id="dob" name="dob" type="date" required />
			</div>
			<div className="grid gap-2">
				<Label htmlFor="role">Role</Label>
				<select
					id="role"
					name="role"
					required
					className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					defaultValue="STAFF"
				>
					<option value="ADMIN">Admin</option>
					<option value="MANAGER">Manager</option>
					<option value="STAFF">Staff</option>
				</select>
			</div>
			<div className="grid gap-2">
				<Label htmlFor="password">Password</Label>
				<Input id="password" name="password" type="password" required minLength={6} />
			</div>
			<Button type="submit" disabled={loading}>
				{loading ? "Creating account..." : "Create account"}
			</Button>
			{error && (
				<p aria-live="polite" className="text-sm text-destructive">
					{error}
				</p>
			)}
			<p className="text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link className="text-primary underline-offset-4 hover:underline" href="/login">
					Log in
				</Link>
			</p>
		</form>
	)
}
