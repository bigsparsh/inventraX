"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package, Users, DollarSign, Eye, ChevronUp, Calendar, Clock, AlertCircle, TrendingDown } from "lucide-react"
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts"

// Types for dashboard data
interface DashboardStats {
	totalProducts: number
	totalUsers: number
	totalCategories: number
	lowStockCount: number
}

interface CategoryDistribution {
	category_name: string
	product_count: number
}

interface InventoryLog {
	log_id: string
	product_name: string
	old_quantity: number
	new_quantity: number
	changed_by_name: string
	changed_at: string
}

interface LowStockProduct {
	product_id: string
	name: string
	quantity: number
	category_name: string
}

interface RecentTransaction {
	transaction_id: string
	product_name: string
	user_name: string
	check_in_time: string
	check_out_time: string | null
	current_status: 'IN' | 'OUT'
}

interface TransactionTrend {
	day: string
	check_ins: number
	check_outs: number
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#a4de6c", "#d084ff", "#ff8c84"]

export default function Dashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [categories, setCategories] = useState<CategoryDistribution[]>([])
	const [logs, setLogs] = useState<InventoryLog[]>([])
	const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
	const [transactions, setTransactions] = useState<RecentTransaction[]>([])
	const [transactionTrends, setTransactionTrends] = useState<TransactionTrend[]>([])
	const [loading, setLoading] = useState(true)
	const [expandedLog, setExpandedLog] = useState<string | null>(null)

	// Fetch dashboard data
	useEffect(() => {
		async function fetchDashboardData() {
			try {
				setLoading(true)
				
				// Fetch all data in parallel
				const [statsRes, categoriesRes, logsRes, lowStockRes, transactionsRes, trendsRes] = await Promise.all([
					fetch('/api/dashboard/stats'),
					fetch('/api/dashboard/categories'),
					fetch('/api/dashboard/logs?limit=10'),
					fetch('/api/dashboard/low-stock?threshold=20'),
					fetch('/api/dashboard/transactions?limit=10'),
					fetch('/api/dashboard/trends')
				])

				if (statsRes.ok) {
					const statsData = await statsRes.json()
					setStats(statsData)
				}
				
				if (categoriesRes.ok) {
					const categoriesData = await categoriesRes.json()
					setCategories(categoriesData)
				}
				
				if (logsRes.ok) {
					const logsData = await logsRes.json()
					setLogs(logsData)
				}
				
				if (lowStockRes.ok) {
					const lowStockData = await lowStockRes.json()
					setLowStockProducts(lowStockData)
				}

				if (transactionsRes.ok) {
					const transactionsData = await transactionsRes.json()
					setTransactions(transactionsData)
				}

				if (trendsRes.ok) {
					const trendsData = await trendsRes.json()
					setTransactionTrends(trendsData)
				}
			} catch (error) {
				console.error('Error fetching dashboard data:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchDashboardData()
	}, [])

	const toggleLogExpansion = (logId: string) => {
		setExpandedLog(expandedLog === logId ? null : logId)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString()
	}

	if (loading) {
		return (
			<div className="flex min-h-screen bg-background">
				<Sidebar />
				<main className="flex-1 md:ml-64 p-6">
					<div className="flex items-center justify-center h-full">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
					</div>
				</main>
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
							<h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
							<p className="text-muted-foreground">Welcome back! Here's your inventory overview.</p>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span>Last updated: {new Date().toLocaleDateString()}</span>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Products</CardTitle>
								<Package className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
								<p className="text-xs text-muted-foreground">
									Products in inventory
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Users</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
								<p className="text-xs text-muted-foreground">
									Registered users
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Categories</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
								<p className="text-xs text-muted-foreground">
									Product categories
								</p>
							</CardContent>
						</Card>

						<Card className="border-orange-500/50">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
								<AlertCircle className="h-4 w-4 text-orange-500" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-orange-500">{stats?.lowStockCount || 0}</div>
								<p className="text-xs text-muted-foreground">
									Items need restocking
								</p>
							</CardContent>
						</Card>
					</div>

				{/* Charts Row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Transaction Trends Chart */}
					<Card>
						<CardHeader>
							<CardTitle>Transaction Activity</CardTitle>
							<CardDescription>Check-ins and check-outs over the last 7 days</CardDescription>
						</CardHeader>
						<CardContent>
							{transactionTrends.length > 0 ? (
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={transactionTrends}>
											<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
											<XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
											<YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
											<Tooltip
												contentStyle={{
													backgroundColor: "#1a1a1a",
													border: "1px solid #333",
													borderRadius: "6px",
													color: "#fff",
												}}
											/>
											<Line
												type="monotone"
												dataKey="check_ins"
												stroke="#8884d8"
												strokeWidth={2}
												dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
												name="Check-Ins"
											/>
											<Line
												type="monotone"
												dataKey="check_outs"
												stroke="#82ca9d"
												strokeWidth={2}
												dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
												name="Check-Outs"
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="h-[300px] flex items-center justify-center text-muted-foreground">
									No transaction data available
								</div>
							)}
						</CardContent>
					</Card>

					{/* Category Distribution */}
					<Card>
						<CardHeader>
							<CardTitle>Product Categories</CardTitle>
							<CardDescription>Distribution of products by category</CardDescription>
						</CardHeader>
						<CardContent>
							{categories.length > 0 ? (
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={categories}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({ category_name, percent }) => `${category_name} ${(percent * 100).toFixed(0)}%`}
												outerRadius={100}
												fill="#8884d8"
												dataKey="product_count"
												nameKey="category_name"
											>
												{categories.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip
												contentStyle={{
													backgroundColor: "#1a1a1a",
													border: "1px solid #333",
													borderRadius: "6px",
													color: "#fff",
												}}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="h-[300px] flex items-center justify-center text-muted-foreground">
									No category data available
								</div>
							)}
							{categories.length > 0 && (
								<div className="mt-4 space-y-2">
									{categories.map((category, index) => (
										<div key={index} className="flex items-center justify-between text-sm">
											<div className="flex items-center gap-2">
												<div
													className="w-3 h-3 rounded-full"
													style={{ backgroundColor: COLORS[index % COLORS.length] }}
												/>
												<span>{category.category_name}</span>
											</div>
											<span className="font-medium">{category.product_count} products</span>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			
			{/* Recent Activity and Inventory Logs */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Transactions */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Transactions</CardTitle>
						<CardDescription>Latest check-ins and check-outs</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{transactions.length > 0 ? (
								transactions.map((transaction, index) => (
									<div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
										<div>
											<p className="font-medium">{transaction.product_name}</p>
											<p className="text-sm text-muted-foreground">by {transaction.user_name}</p>
										</div>
										<div className="text-right">
											<Badge variant={transaction.current_status === 'IN' ? 'default' : 'secondary'}>
												{transaction.current_status}
											</Badge>
											<p className="text-xs text-muted-foreground mt-1">
												{new Date(transaction.check_in_time).toLocaleString()}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="text-center text-muted-foreground py-4">No transactions found</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Inventory Logs */}
				<Card>
					<CardHeader>
						<CardTitle>Inventory Changes</CardTitle>
						<CardDescription>Recent quantity updates</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{logs.length > 0 ? (
								logs.map((log, index) => {
									const isIncrease = (log.new_quantity || 0) > (log.old_quantity || 0);
									const change = Math.abs((log.new_quantity || 0) - (log.old_quantity || 0));
									
									return (
										<div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
											<div>
												<p className="font-medium">{log.product_name}</p>
												<p className="text-sm text-muted-foreground">by {log.changed_by_name}</p>
											</div>
											<div className="text-right">
												<div className="flex items-center gap-2 justify-end">
													<span className="text-sm">{log.old_quantity} →</span>
													<Badge variant={isIncrease ? 'default' : 'destructive'}>
														{isIncrease ? '+' : '-'}{change}
													</Badge>
													<span className="text-sm font-medium">{log.new_quantity}</span>
												</div>
												<p className="text-xs text-muted-foreground mt-1">
													{new Date(log.changed_at).toLocaleString()}
												</p>
											</div>
										</div>
									);
								})
							) : (
								<p className="text-center text-muted-foreground py-4">No inventory changes found</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</main>
</div>
	)
}
