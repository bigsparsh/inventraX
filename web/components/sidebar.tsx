"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Package, Database, Home, Menu, X, BarChart3, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: Home },
	{ name: "Natural Query", href: "/natural", icon: MessageSquare },
	{ name: "Manage Staff", href: "/staff", icon: Users },
	{ name: "Manage Products", href: "/products", icon: Package },
	{ name: "View Data", href: "/data", icon: Database },
]

export function Sidebar() {
	const [isOpen, setIsOpen] = useState(false)
	const pathname = usePathname()
	const router = useRouter()
	const { user, logout } = useAuth()

	const handleLogout = () => {
		logout()
		router.push('/login')
		setIsOpen(false)
	}

	return (
		<>
			{/* Mobile menu button */}
			<Button
				variant="ghost"
				size="icon"
				className="fixed top-4 left-4 z-50 md:hidden"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
			</Button>

			{/* Sidebar */}
			<div
				className={cn(
					"fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center gap-2 px-6 py-6 border-b border-sidebar-border">
						<div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
							<BarChart3 className="h-5 w-5 text-primary-foreground" />
						</div>
						<span className="text-xl font-semibold text-sidebar-foreground">InventoryIQ</span>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-4 py-6 space-y-2">
						{navigation.map((item) => {
							const isActive = pathname === item.href
							return (
								<Link
									key={item.name}
									href={item.href}
									className={cn(
										"flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
										isActive
											? "bg-sidebar-primary text-sidebar-primary-foreground"
											: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
									)}
									onClick={() => setIsOpen(false)}
								>
									<item.icon className="h-5 w-5" />
									{item.name}
								</Link>
							)
						})}
					</nav>

					{/* Footer with User Info and Logout */}
					<div className="px-4 py-4 border-t border-sidebar-border space-y-3">
						{user && (
							<div className="px-2">
								<p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
								<p className="text-xs text-muted-foreground truncate">{user.email}</p>
								<p className="text-xs text-muted-foreground mt-1">
									<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
										{user.role}
									</span>
								</p>
							</div>
						)}
						<Button 
							variant="ghost" 
							className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
							onClick={handleLogout}
						>
							<LogOut className="h-4 w-4 mr-2" />
							Logout
						</Button>
						<p className="text-xs text-muted-foreground px-2">InventoryIQ v1.0</p>
					</div>
				</div>
			</div>

			{/* Overlay for mobile */}
			{isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
		</>
	)
}
