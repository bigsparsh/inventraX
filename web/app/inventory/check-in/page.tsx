"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Search, PackagePlus, Loader2, CheckCircle, AlertCircle, Package } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface Product {
	product_id: string
	name: string
	description: string
	category_id: string
	category_name?: string
	quantity: number
	image: string | null
}

interface Category {
	category_id: string
	name: string
	description: string
}

interface InventoryLog {
	log_id: string
	product_name: string
	old_quantity: number
	new_quantity: number
	changed_by_name: string
	changed_at: string
}

export default function CheckInPage() {
	const { user, isAuthenticated, isLoading: authLoading } = useAuth()
	const router = useRouter()
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<string>("all")
	const [isLoading, setIsLoading] = useState(true)
	const [isLoadingLogs, setIsLoadingLogs] = useState(true)
	const [isCheckingIn, setIsCheckingIn] = useState(false)
	const [showConfirmDialog, setShowConfirmDialog] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [successMessage, setSuccessMessage] = useState("")
	const [errorMessage, setErrorMessage] = useState("")

	// Redirect if not authenticated
	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login')
		}
	}, [authLoading, isAuthenticated, router])

	// Fetch products
	useEffect(() => {
		if (isAuthenticated) {
			fetchProducts()
			fetchCategories()
			fetchInventoryLogs()
		}
	}, [isAuthenticated])

	const fetchProducts = async () => {
		try {
			const response = await fetch('/api/products')
			if (response.ok) {
				const data = await response.json()
				setProducts(data)
			}
		} catch (error) {
			console.error('Error fetching products:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const fetchCategories = async () => {
		try {
			const response = await fetch('/api/categories')
			if (response.ok) {
				const data = await response.json()
				setCategories(data)
			}
		} catch (error) {
			console.error('Error fetching categories:', error)
		}
	}

	const fetchInventoryLogs = async () => {
		try {
			setIsLoadingLogs(true)
			const response = await fetch('/api/dashboard/logs?limit=10')
			if (response.ok) {
				const data = await response.json()
				console.log('Inventory logs fetched:', data)
				setInventoryLogs(data || [])
			} else {
				console.error('Failed to fetch logs:', response.statusText)
				setInventoryLogs([])
			}
		} catch (error) {
			console.error('Error fetching inventory logs:', error)
			setInventoryLogs([])
		} finally {
			setIsLoadingLogs(false)
		}
	}

	const handleCheckIn = async () => {
		if (!selectedProduct || !user) return

		setIsCheckingIn(true)
		setErrorMessage("")
		setSuccessMessage("")

		try {
			const response = await fetch('/api/inventory/check-in', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					productId: selectedProduct.product_id,
					userId: user.userId,
				}),
			})

			if (response.ok) {
				setSuccessMessage(`Successfully checked in ${selectedProduct.name}`)
				setShowConfirmDialog(false)
				setSelectedProduct(null)
				// Refresh data
				await fetchProducts()
				await fetchInventoryLogs()
				
				// Clear success message after 3 seconds
				setTimeout(() => setSuccessMessage(""), 3000)
			} else {
				const error = await response.json()
				setErrorMessage(error.error || 'Failed to check in product')
			}
		} catch (error) {
			console.error('Error checking in product:', error)
			setErrorMessage('An error occurred while checking in the product')
		} finally {
			setIsCheckingIn(false)
		}
	}

	const openConfirmDialog = (product: Product) => {
		setSelectedProduct(product)
		setShowConfirmDialog(true)
	}

	// Filter products
	const filteredProducts = products.filter((product) => {
		const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.description?.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory
		return matchesSearch && matchesCategory
	})

	if (authLoading || !isAuthenticated) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		)
	}

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />

			<main className="flex-1 md:ml-64 p-6">
				<div className="max-w-7xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Check In Inventory</h1>
							<p className="text-muted-foreground">
								Add products to inventory
							</p>
						</div>
					</div>
					{/* Success/Error Messages */}
					{successMessage && (
						<div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
							<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
							<span className="text-green-800 dark:text-green-200">{successMessage}</span>
						</div>
					)}

					{errorMessage && (
						<div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
							<span className="text-red-800 dark:text-red-200">{errorMessage}</span>
						</div>
					)}

					{/* Filters */}
					<Card>
						<CardHeader>
							<CardTitle>Select Product to Check In</CardTitle>
							<CardDescription>
								Choose a product from the list below to add to inventory
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder="Search products..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9"
									/>
								</div>
								<Select value={selectedCategory} onValueChange={setSelectedCategory}>
									<SelectTrigger className="w-full sm:w-[200px]">
										<SelectValue placeholder="All Categories" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										{categories.map((category) => (
											<SelectItem key={category.category_id} value={category.category_id}>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Products List */}
					<Card>
						<CardHeader>
							<CardTitle>Available Products</CardTitle>
							<CardDescription>
								{filteredProducts.length} product(s) found
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex justify-center items-center py-8">
									<Loader2 className="h-8 w-8 animate-spin" />
								</div>
							) : filteredProducts.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
									<p>No products found</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Product Name</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>Description</TableHead>
											<TableHead className="text-right">Current Stock</TableHead>
											<TableHead className="text-right">Action</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredProducts.map((product) => (
											<TableRow key={product.product_id}>
												<TableCell className="font-medium">{product.name}</TableCell>
												<TableCell>
													<Badge variant="outline">{product.category_name || 'N/A'}</Badge>
												</TableCell>
												<TableCell className="max-w-xs truncate">
													{product.description || 'No description'}
												</TableCell>
												<TableCell className="text-right">
													<Badge 
														variant={product.quantity < 10 ? "destructive" : "secondary"}
													>
														{product.quantity}
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													<Button
														size="sm"
														onClick={() => openConfirmDialog(product)}
														disabled={isCheckingIn}
													>
														<PackagePlus className="h-4 w-4 mr-2" />
														Check In
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					{/* Recent Inventory Logs */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Inventory Changes</CardTitle>
							<CardDescription>
								Latest inventory movements and updates
							</CardDescription>
						</CardHeader>
					<CardContent>
						{isLoadingLogs ? (
							<div className="flex justify-center items-center py-8">
								<Loader2 className="h-8 w-8 animate-spin" />
							</div>
						) : inventoryLogs.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<p>No inventory logs yet</p>
							</div>
						) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Product</TableHead>
											<TableHead>Old Quantity</TableHead>
											<TableHead>New Quantity</TableHead>
											<TableHead>Change</TableHead>
											<TableHead>Changed By</TableHead>
											<TableHead>Date</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{inventoryLogs.map((log) => (
											<TableRow key={log.log_id}>
												<TableCell className="font-medium">{log.product_name}</TableCell>
												<TableCell>{log.old_quantity}</TableCell>
												<TableCell>{log.new_quantity}</TableCell>
												<TableCell>
													<Badge 
														variant={log.new_quantity > log.old_quantity ? "default" : "destructive"}
													>
														{log.new_quantity > log.old_quantity ? '+' : ''}
														{log.new_quantity - log.old_quantity}
													</Badge>
												</TableCell>
													<TableCell>{log.changed_by_name}</TableCell>
													<TableCell>
														{log.changed_at ? new Date(log.changed_at).toLocaleString() : 'Recently'}
													</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</div>
			</main>

			{/* Confirmation Dialog */}
			<Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Check In</DialogTitle>
						<DialogDescription>
							Are you sure you want to check in this product?
						</DialogDescription>
					</DialogHeader>
					{selectedProduct && (
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<p className="text-sm font-medium">Product Name:</p>
								<p className="text-sm text-muted-foreground">{selectedProduct.name}</p>
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">Current Quantity:</p>
								<p className="text-sm text-muted-foreground">{selectedProduct.quantity}</p>
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">New Quantity:</p>
								<p className="text-sm text-green-600 font-semibold">{selectedProduct.quantity + 1}</p>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowConfirmDialog(false)}
							disabled={isCheckingIn}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCheckIn}
							disabled={isCheckingIn}
						>
							{isCheckingIn ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Checking In...
								</>
							) : (
								<>
									<PackagePlus className="mr-2 h-4 w-4" />
									Confirm Check In
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
