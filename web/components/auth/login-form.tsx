"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
	const router = useRouter()
	const { login } = useAuth()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)
		setLoading(true)
		
		const form = new FormData(e.currentTarget)
		const email = String(form.get("email") || "")
		const password = String(form.get("password") || "")
		
		try {
			await login(email, password)
			// Redirect to dashboard on successful login
			router.push('/dashboard')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed')
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
				<Label htmlFor="password">Password</Label>
				<Input id="password" name="password" type="password" required minLength={6} />
			</div>
			<Button type="submit" disabled={loading}>
				{loading ? "Signing in..." : "Sign in"}
			</Button>
			{error && (
				<p aria-live="polite" className="text-sm text-destructive">
					{error}
				</p>
			)}
			<p className="text-sm text-muted-foreground">
				Don&apos;t have an account?{" "}
				<Link className="text-primary underline-offset-4 hover:underline" href="/register">
					Sign up
				</Link>
			</p>
		</form>
	)
}
