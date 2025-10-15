"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Database,
	Search,
	Download,
	Users,
	Package,
	FolderTree,
	ArrowLeftRight,
	FileText,
	Shield,
	Edit,
	Trash2,
	Plus,
	MoreVertical,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/contexts/auth-context"
import {
	getAllUsers,
	createUser,
	updateUser,
	deleteUser,
	getAllCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	getAllProductsData,
	createProductData,
	updateProductData,
	deleteProductData,
	getAllTransactions,
	createTransaction,
	deleteTransaction,
	getAllInventoryLogs,
	deleteInventoryLog,
	getAllRoleMappings,
	createRoleMapping,
	updateRoleMapping,
	deleteRoleMapping,
} from "@/actions/data"

type TableType = "users" | "categories" | "products" | "transactions" | "inventory_logs" | "role_mapping"

// Form schemas matching database schema
const userSchema = z.object({
	name: z.string().min(1).max(100),
	email: z.string().email(),
	dob: z.string().min(1),
	role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
})

const categorySchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().optional(),
})

const productSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().optional(),
	category_id: z.string().uuid(),
	quantity: z.number().int().min(0),
})

const transactionSchema = z.object({
	user_id: z.string().uuid(),
	product_id: z.string().uuid(),
	current_status: z.enum(['IN', 'OUT']),
})

const roleMappingSchema = z.object({
	user_id: z.string().uuid(),
	role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
})

const tableConfigs = {
	users: {
		title: "Users",
		icon: Users,
		columns: ["ID", "Name", "Email", "DOB", "Role"],
		keys: ["user_id", "name", "email", "dob", "role"],
		canAdd: true,
		canEdit: true,
		canDelete: true,
	},
	categories: {
		title: "Categories",
		icon: FolderTree,
		columns: ["ID", "Name", "Description", "Products", "Created"],
		keys: ["category_id", "name", "description", "product_count", "created_at"],
		canAdd: true,
		canEdit: true,
		canDelete: true,
	},
	products: {
		title: "Products",
		icon: Package,
		columns: ["ID", "Name", "Category", "Quantity"],
		keys: ["product_id", "name", "category_name", "quantity"],
		canAdd: true,
		canEdit: true,
		canDelete: true,
	},
	transactions: {
		title: "Transactions",
		icon: ArrowLeftRight,
		columns: ["ID", "User", "Product", "Check In", "Status"],
		keys: ["transaction_id", "user_name", "product_name", "check_in_time", "current_status"],
		canAdd: true,
		canEdit: false,
		canDelete: true,
	},
	inventory_logs: {
		title: "Inventory Logs",
		icon: FileText,
		columns: ["ID", "Product", "Old Qty", "New Qty", "Changed By"],
		keys: ["log_id", "product_name", "old_quantity", "new_quantity", "changed_by_name"],
		canAdd: false,
		canEdit: false,
		canDelete: true,
	},
	role_mapping: {
		title: "Role Mapping",
		icon: Shield,
		columns: ["Role ID", "User", "Email", "Role"],
		keys: ["role_id", "user_name", "email", "role"],
		canAdd: true,
		canEdit: true,
		canDelete: true,
	},
}

export default function DataPage() {
	const { hasPermission, user } = useAuth()
	const [activeTable, setActiveTable] = useState<TableType>("users")
	const [searchTerm, setSearchTerm] = useState("")
	const [data, setData] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

	// Dialog states
	const [addDialogOpen, setAddDialogOpen] = useState(false)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [selectedRow, setSelectedRow] = useState<any>(null)

	// Additional data for dropdowns
	const [categories, setCategories] = useState<any[]>([])
	const [users, setUsers] = useState<any[]>([])
	const [products, setProducts] = useState<any[]>([])

	// Forms
	const userForm = useForm<z.infer<typeof userSchema>>({
		resolver: zodResolver(userSchema),
		defaultValues: { name: "", email: "", dob: "", role: undefined },
	})

	const categoryForm = useForm<z.infer<typeof categorySchema>>({
		resolver: zodResolver(categorySchema),
		defaultValues: { name: "", description: "" },
	})

	const productForm = useForm<z.infer<typeof productSchema>>({
		resolver: zodResolver(productSchema),
		defaultValues: { name: "", description: "", category_id: "", quantity: 0 },
	})

	const transactionForm = useForm<z.infer<typeof transactionSchema>>({
		resolver: zodResolver(transactionSchema),
		defaultValues: { user_id: "", product_id: "", current_status: "IN" },
	})

	const roleMappingForm = useForm<z.infer<typeof roleMappingSchema>>({
		resolver: zodResolver(roleMappingSchema),
		defaultValues: { user_id: "", role: "STAFF" },
	})

	useEffect(() => {
		fetchData()
		fetchDropdownData()
		setSelectedRows(new Set())
	}, [activeTable])

	const fetchData = async () => {
		setLoading(true)
		try {
			let result
			switch (activeTable) {
				case "users":
					result = await getAllUsers()
					break
				case "categories":
					result = await getAllCategories()
					break
				case "products":
					result = await getAllProductsData()
					break
				case "transactions":
					result = await getAllTransactions()
					break
				case "inventory_logs":
					result = await getAllInventoryLogs()
					break
				case "role_mapping":
					result = await getAllRoleMappings()
					break
			}
			setData(result || [])
		} catch (error) {
			console.error("Error fetching data:", error)
			setData([])
		} finally {
			setLoading(false)
		}
	}

	const fetchDropdownData = async () => {
		try {
			const [cats, usrs, prods] = await Promise.all([
				getAllCategories(),
				getAllUsers(),
				getAllProductsData(),
			])
			setCategories(cats)
			setUsers(usrs)
			setProducts(prods)
		} catch (error) {
			console.error("Error fetching dropdown data:", error)
		}
	}

	const currentConfig = tableConfigs[activeTable]

	const filteredData = data.filter((row) =>
		Object.values(row).some((value) =>
			value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
		)
	)

	const getRowId = (row: any) => {
		switch (activeTable) {
			case "users": return row.user_id
			case "categories": return row.category_id
			case "products": return row.product_id
			case "transactions": return row.transaction_id
			case "inventory_logs": return row.log_id
			case "role_mapping": return row.role_id
			default: return row.id
		}
	}

	const toggleRowSelection = (rowId: string) => {
		const newSelection = new Set(selectedRows)
		if (newSelection.has(rowId)) {
			newSelection.delete(rowId)
		} else {
			newSelection.add(rowId)
		}
		setSelectedRows(newSelection)
	}

	const toggleAllRows = () => {
		if (selectedRows.size === filteredData.length) {
			setSelectedRows(new Set())
		} else {
			setSelectedRows(new Set(filteredData.map(row => getRowId(row))))
		}
	}

	const formatCellValue = (value: any, key: string) => {
		if (value === null || value === undefined) return "—"

		if (key === "current_status") {
			return <Badge variant={value === "IN" ? "default" : "secondary"}>{value}</Badge>
		}

		if (key === "role") {
			const roleColors: Record<string, "default" | "secondary" | "outline"> = {
				ADMIN: "default",
				MANAGER: "secondary",
				STAFF: "outline",
			}
			return <Badge variant={roleColors[value] || "outline"}>{value}</Badge>
		}

		if (key.includes("time") || key.includes("_at") || key === "dob") {
			try {
				return new Date(value).toLocaleDateString()
			} catch {
				return value
			}
		}

		if (key.includes("_id") && typeof value === "string" && value.length > 20) {
			return value.substring(0, 8) + "..."
		}

		return value
	}

	const exportData = () => {
		const csvContent = [
			currentConfig.columns.join(","),
			...filteredData.map((row) =>
				currentConfig.keys.map((key) => row[key] || "").join(",")
			),
		].join("\n")

		const blob = new Blob([csvContent], { type: "text/csv" })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `${activeTable}_data.csv`
		a.click()
		window.URL.revokeObjectURL(url)
	}

	const handleAdd = () => {
		userForm.reset()
		categoryForm.reset()
		productForm.reset()
		transactionForm.reset()
		roleMappingForm.reset()
		setAddDialogOpen(true)
	}

	const handleEdit = (row: any) => {
		setSelectedRow(row)

		switch (activeTable) {
			case "users":
				userForm.reset({
					name: row.name,
					email: row.email,
					dob: row.dob?.split('T')[0],
					role: row.role,
				})
				break
			case "categories":
				categoryForm.reset({
					name: row.name,
					description: row.description || "",
				})
				break
			case "products":
				productForm.reset({
					name: row.name,
					description: row.description || "",
					category_id: row.category_id,
					quantity: row.quantity,
				})
				break
			case "role_mapping":
				roleMappingForm.reset({
					user_id: row.user_id,
					role: row.role,
				})
				break
		}

		setEditDialogOpen(true)
	}

	const handleDelete = (row: any) => {
		setSelectedRow(row)
		setDeleteDialogOpen(true)
	}

	const handleBulkDelete = () => {
		if (selectedRows.size === 0) return
		setDeleteDialogOpen(true)
	}

	const confirmDelete = async () => {
		try {
			if (selectedRows.size > 0) {
				// Bulk delete
				const deletePromises = Array.from(selectedRows).map(rowId => {
					switch (activeTable) {
						case "users": return deleteUser(rowId)
						case "categories": return deleteCategory(rowId)
						case "products": return deleteProductData(rowId)
						case "transactions": return deleteTransaction(rowId)
						case "inventory_logs": return deleteInventoryLog(rowId)
						case "role_mapping": return deleteRoleMapping(rowId)
					}
				})
				await Promise.all(deletePromises)
				setSelectedRows(new Set())
			} else if (selectedRow) {
				// Single delete
				const rowId = getRowId(selectedRow)
				switch (activeTable) {
					case "users": await deleteUser(rowId); break
					case "categories": await deleteCategory(rowId); break
					case "products": await deleteProductData(rowId); break
					case "transactions": await deleteTransaction(rowId); break
					case "inventory_logs": await deleteInventoryLog(rowId); break
					case "role_mapping": await deleteRoleMapping(rowId); break
				}
			}

			await fetchData()
			setDeleteDialogOpen(false)
			setSelectedRow(null)
		} catch (error) {
			console.error("Error deleting:", error)
		}
	}

	const onSubmitUser = async (values: z.infer<typeof userSchema>) => {
		try {
			if (editDialogOpen && selectedRow) {
				await updateUser(selectedRow.user_id, values)
			} else {
				await createUser(values)
			}
			await fetchData()
			setAddDialogOpen(false)
			setEditDialogOpen(false)
			userForm.reset()
		} catch (error) {
			console.error("Error saving user:", error)
		}
	}

	const onSubmitCategory = async (values: z.infer<typeof categorySchema>) => {
		try {
			if (editDialogOpen && selectedRow) {
				await updateCategory(selectedRow.category_id, values)
			} else {
				await createCategory(values)
			}
			await fetchData()
			await fetchDropdownData()
			setAddDialogOpen(false)
			setEditDialogOpen(false)
			categoryForm.reset()
		} catch (error) {
			console.error("Error saving category:", error)
		}
	}

	const onSubmitProduct = async (values: z.infer<typeof productSchema>) => {
		try {
			if (editDialogOpen && selectedRow) {
				await updateProductData(selectedRow.product_id, values)
			} else {
				await createProductData(values)
			}
			await fetchData()
			await fetchDropdownData()
			setAddDialogOpen(false)
			setEditDialogOpen(false)
			productForm.reset()
		} catch (error) {
			console.error("Error saving product:", error)
		}
	}

	const onSubmitTransaction = async (values: z.infer<typeof transactionSchema>) => {
		try {
			await createTransaction(values)
			await fetchData()
			setAddDialogOpen(false)
			transactionForm.reset()
		} catch (error) {
			console.error("Error creating transaction:", error)
		}
	}

	const onSubmitRoleMapping = async (values: z.infer<typeof roleMappingSchema>) => {
		try {
			if (editDialogOpen && selectedRow) {
				await updateRoleMapping(selectedRow.role_id, { role: values.role })
			} else {
				await createRoleMapping(values)
			}
			await fetchData()
			setAddDialogOpen(false)
			setEditDialogOpen(false)
			roleMappingForm.reset()
		} catch (error) {
			console.error("Error saving role mapping:", error)
		}
	}

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />

			<main className="flex-1 md:ml-64 p-6">
				<div className="max-w-7xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
								<Database className="h-8 w-8 text-primary" />
								Data Management
							</h1>
							<p className="text-muted-foreground">
								Full CRUD operations for all database tables
								{user && !hasPermission('create') && (
									<span className="ml-2 text-amber-600 font-medium">
										(Read-Only Access)
									</span>
								)}
							</p>
						</div>
						<div className="flex gap-2">
							{selectedRows.size > 0 && hasPermission('delete') && currentConfig.canDelete && (
								<Button variant="destructive" onClick={handleBulkDelete}>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete {selectedRows.size} Selected
								</Button>
							)}
							{hasPermission('create') && currentConfig.canAdd && (
								<Button onClick={handleAdd}>
									<Plus className="h-4 w-4 mr-2" />
									Add {currentConfig.title.slice(0, -1)}
								</Button>
							)}
							<Button variant="outline" onClick={exportData}>
								<Download className="h-4 w-4 mr-2" />
								Export CSV
							</Button>
						</div>
					</div>

					{/* Table Selection */}
					<div className="flex flex-wrap gap-2">
						{(Object.entries(tableConfigs) as [TableType, typeof tableConfigs[TableType]][]).map(([key, config]) => {
							const IconComponent = config.icon
							return (
								<Button
									key={key}
									variant={activeTable === key ? "default" : "outline"}
									onClick={() => setActiveTable(key)}
									className="flex items-center gap-2"
								>
									<IconComponent className="h-4 w-4" />
									{config.title}
								</Button>
							)
						})}
					</div>

					{/* Search */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-4">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder={`Search ${currentConfig.title.toLowerCase()}...`}
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
								<Badge variant="secondary" className="px-3 py-1">
									{filteredData.length} records
								</Badge>
							</div>
						</CardContent>
					</Card>

					{/* Data Table */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<currentConfig.icon className="h-5 w-5" />
								{currentConfig.title}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											{hasPermission('delete') && currentConfig.canDelete && (
												<TableHead className="w-12">
													<Checkbox
														checked={selectedRows.size === filteredData.length && filteredData.length > 0}
														onCheckedChange={toggleAllRows}
													/>
												</TableHead>
											)}
											{currentConfig.columns.map((column) => (
												<TableHead key={column} className="font-medium">
													{column}
												</TableHead>
											))}
											{(hasPermission('update') || hasPermission('delete')) && (
												<TableHead className="text-right">Actions</TableHead>
											)}
										</TableRow>
									</TableHeader>
									<TableBody>
										{loading ? (
											<TableRow>
												<TableCell colSpan={currentConfig.columns.length + 2} className="text-center py-8">
													Loading...
												</TableCell>
											</TableRow>
										) : filteredData.length > 0 ? (
											filteredData.map((row, index) => {
												const rowId = getRowId(row)
												return (
													<TableRow key={index}>
														{hasPermission('delete') && currentConfig.canDelete && (
															<TableCell>
																<Checkbox
																	checked={selectedRows.has(rowId)}
																	onCheckedChange={() => toggleRowSelection(rowId)}
																/>
															</TableCell>
														)}
														{currentConfig.keys.map((key) => (
															<TableCell key={key}>{formatCellValue(row[key], key)}</TableCell>
														))}
														{(hasPermission('update') || hasPermission('delete')) && (
															<TableCell className="text-right">
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<Button variant="ghost" size="icon" className="h-8 w-8">
																			<MoreVertical className="h-4 w-4" />
																		</Button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent align="end">
																		{hasPermission('update') && currentConfig.canEdit && (
																			<DropdownMenuItem onClick={() => handleEdit(row)}>
																				<Edit className="h-4 w-4 mr-2" />
																				Edit
																			</DropdownMenuItem>
																		)}
																		{hasPermission('delete') && currentConfig.canDelete && (
																			<DropdownMenuItem
																				onClick={() => handleDelete(row)}
																				className="text-destructive focus:text-destructive"
																			>
																				<Trash2 className="h-4 w-4 mr-2" />
																				Delete
																			</DropdownMenuItem>
																		)}
																	</DropdownMenuContent>
																</DropdownMenu>
															</TableCell>
														)}
													</TableRow>
												)
											})
										) : (
											<TableRow>
												<TableCell colSpan={currentConfig.columns.length + 2} className="text-center py-8">
													<div className="flex flex-col items-center gap-2">
														<Database className="h-8 w-8 text-muted-foreground" />
														<p className="text-muted-foreground">No data found</p>
													</div>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>

					{/* Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center gap-2">
									<Database className="h-5 w-5 text-primary" />
									<div>
										<p className="text-sm text-muted-foreground">Total Records</p>
										<p className="text-2xl font-bold">{data.length}</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center gap-2">
									<Search className="h-5 w-5 text-primary" />
									<div>
										<p className="text-sm text-muted-foreground">Filtered Results</p>
										<p className="text-2xl font-bold">{filteredData.length}</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center gap-2">
									<Shield className="h-5 w-5 text-primary" />
									<div>
										<p className="text-sm text-muted-foreground">Selected</p>
										<p className="text-2xl font-bold">{selectedRows.size}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>

			{/* Add/Edit Dialogs */}
			{/* Users Dialog */}
			<Dialog open={(addDialogOpen || editDialogOpen) && activeTable === "users"} onOpenChange={(open) => {
				setAddDialogOpen(open)
				setEditDialogOpen(open)
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editDialogOpen ? "Edit" : "Add"} User</DialogTitle>
						<DialogDescription>
							{editDialogOpen ? "Update user information" : "Create a new user"}
						</DialogDescription>
					</DialogHeader>
					<Form {...userForm}>
						<form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
							<FormField
								control={userForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={userForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={userForm.control}
								name="dob"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Date of Birth</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={userForm.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Role (Optional)</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select role" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="STAFF">Staff</SelectItem>
												<SelectItem value="MANAGER">Manager</SelectItem>
												<SelectItem value="ADMIN">Admin</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="submit">Save</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Categories Dialog */}
			<Dialog open={(addDialogOpen || editDialogOpen) && activeTable === "categories"} onOpenChange={(open) => {
				setAddDialogOpen(open)
				setEditDialogOpen(open)
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editDialogOpen ? "Edit" : "Add"} Category</DialogTitle>
						<DialogDescription>
							{editDialogOpen ? "Update category information" : "Create a new category"}
						</DialogDescription>
					</DialogHeader>
					<Form {...categoryForm}>
						<form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
							<FormField
								control={categoryForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={categoryForm.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description (Optional)</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="submit">Save</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Products Dialog */}
			<Dialog open={(addDialogOpen || editDialogOpen) && activeTable === "products"} onOpenChange={(open) => {
				setAddDialogOpen(open)
				setEditDialogOpen(open)
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editDialogOpen ? "Edit" : "Add"} Product</DialogTitle>
						<DialogDescription>
							{editDialogOpen ? "Update product information" : "Create a new product"}
						</DialogDescription>
					</DialogHeader>
					<Form {...productForm}>
						<form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
							<FormField
								control={productForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={productForm.control}
								name="category_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{categories.map((cat) => (
													<SelectItem key={cat.category_id} value={cat.category_id}>
														{cat.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={productForm.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description (Optional)</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={productForm.control}
								name="quantity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quantity</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="submit">Save</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Transactions Dialog */}
			<Dialog open={addDialogOpen && activeTable === "transactions"} onOpenChange={setAddDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Transaction</DialogTitle>
						<DialogDescription>Create a new transaction</DialogDescription>
					</DialogHeader>
					<Form {...transactionForm}>
						<form onSubmit={transactionForm.handleSubmit(onSubmitTransaction)} className="space-y-4">
							<FormField
								control={transactionForm.control}
								name="user_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>User</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select user" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{users.map((user) => (
													<SelectItem key={user.user_id} value={user.user_id}>
														{user.name} - {user.email}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={transactionForm.control}
								name="product_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Product</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select product" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{products.map((product) => (
													<SelectItem key={product.product_id} value={product.product_id}>
														{product.name} (Qty: {product.quantity})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={transactionForm.control}
								name="current_status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="IN">Check In</SelectItem>
												<SelectItem value="OUT">Check Out</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="submit">Create</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Role Mapping Dialog */}
			<Dialog open={(addDialogOpen || editDialogOpen) && activeTable === "role_mapping"} onOpenChange={(open) => {
				setAddDialogOpen(open)
				setEditDialogOpen(open)
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editDialogOpen ? "Edit" : "Add"} Role Mapping</DialogTitle>
						<DialogDescription>
							{editDialogOpen ? "Update role assignment" : "Assign a role to a user"}
						</DialogDescription>
					</DialogHeader>
					<Form {...roleMappingForm}>
						<form onSubmit={roleMappingForm.handleSubmit(onSubmitRoleMapping)} className="space-y-4">
							<FormField
								control={roleMappingForm.control}
								name="user_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>User</FormLabel>
										<Select onValueChange={field.onChange} value={field.value} disabled={editDialogOpen}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select user" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{users.map((user) => (
													<SelectItem key={user.user_id} value={user.user_id}>
														{user.name} - {user.email}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={roleMappingForm.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Role</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="STAFF">Staff</SelectItem>
												<SelectItem value="MANAGER">Manager</SelectItem>
												<SelectItem value="ADMIN">Admin</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="submit">Save</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {selectedRows.size > 0 ? `${selectedRows.size} Items` : currentConfig.title.slice(0, -1)}</AlertDialogTitle>
						<AlertDialogDescription>
							{selectedRows.size > 0
								? `Are you sure you want to delete ${selectedRows.size} selected items? This action cannot be undone.`
								: `Are you sure you want to delete this record? This action cannot be undone.`
							}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
