"use client"

import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Sparkles, Database, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "axios"
import { Bar, BarChart, Line, LineChart, Area, AreaChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Interface matching the backend RAG response format for chart visualizations
interface ChartVisualization {
	query: string
	chart_type: "bar" | "line" | "pie" | "area" | "scatter"
	title: string
	description: string
	data: Record<string, any>[]  // Array of objects with dynamic keys
	x_axis_key: string           // Key to use for X-axis data
	y_axis_keys: string[]        // Keys to use for Y-axis data (supports multiple series)
	colors: string[]             // Color palette for the chart
	show_legend: boolean
	show_grid: boolean
}

interface BackendResponse {
	message: string
	query?: string
	content?: any[]
	visualization?: ChartVisualization
	response_type?: "data" | "visualization"
}

interface Message {
	id: string
	type: "user" | "assistant"
	content: string
	timestamp: Date
	sqlQuery?: string
	results?: any[]
	visualization?: ChartVisualization
}

const sampleQueries = [
	"Show me all products with low stock",
	"Visualize items with low stock as a bar chart",
	"What are our top selling products this month?",
	"Show stock levels across categories in a pie chart",
	"List all staff members with manager role",
	"Find products added in the last 7 days",
]

interface ChartRendererProps {
	visualization: ChartVisualization
}

/**
 * ChartRenderer component that dynamically renders different chart types
 * based on the backend RAG response format. Supports bar, line, area, and pie charts.
 * 
 * The component automatically configures chart properties from the visualization data:
 * - Creates color schemes from the provided colors array
 * - Handles single or multiple data series (y_axis_keys)
 * - Configures legend and grid visibility
 * - Applies responsive design with proper spacing
 */
const ChartRenderer: React.FC<ChartRendererProps> = ({ visualization }) => {
	const { chart_type, data, x_axis_key, y_axis_keys, colors, show_legend, show_grid, title, description } = visualization

	// Debug logging
	console.log("Chart Renderer Data:", { chart_type, data, x_axis_key, y_axis_keys, colors })

	const renderChart = () => {
		const commonProps = {
			data,
			margin: { top: 20, right: 20, left: 20, bottom: 20 }
		}

		switch (chart_type) {
			case "bar":
				return (
					<BarChart {...commonProps}>
						{show_grid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
						<XAxis 
							dataKey={x_axis_key}
							tick={{ fill: 'currentColor', fontSize: 12 }}
							tickLine={{ stroke: 'currentColor' }}
							axisLine={{ stroke: 'currentColor' }}
						/>
						<YAxis 
							tick={{ fill: 'currentColor', fontSize: 12 }}
							tickLine={{ stroke: 'currentColor' }}
							axisLine={{ stroke: 'currentColor' }}
							allowDecimals={false}
						/>
						<Tooltip 
							contentStyle={{ 
								backgroundColor: '#1a1a1a',
								border: '1px solid #333',
								borderRadius: '6px',
								color: '#fff',
								padding: '8px 12px',
								boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
							}}
							cursor={{ fill: 'hsl(var(--muted))' }}
						/>
						{show_legend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
						{y_axis_keys.map((key, index) => (
							<Bar
								key={key}
								dataKey={key}
								fill={colors[index] || colors[0] || "#8884d8"}
								radius={[4, 4, 0, 0]}
								name={key}
							/>
						))}
					</BarChart>
				)

			case "line":
				return (
					<LineChart {...commonProps}>
						{show_grid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
						<XAxis 
							dataKey={x_axis_key}
							tick={{ fill: 'currentColor', fontSize: 12 }}
							tickLine={{ stroke: 'currentColor' }}
							axisLine={{ stroke: 'currentColor' }}
						/>
						<YAxis 
							tick={{ fill: 'currentColor', fontSize: 12 }}
							tickLine={{ stroke: 'currentColor' }}
							axisLine={{ stroke: 'currentColor' }}
							allowDecimals={false}
						/>
						<Tooltip 
							contentStyle={{ 
								backgroundColor: '#1a1a1a',
								border: '1px solid #333',
								borderRadius: '6px',
								color: '#fff',
								padding: '8px 12px',
								boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
							}}
						/>
						{show_legend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
						{y_axis_keys.map((key, index) => (
							<Line
								key={key}
								type="monotone"
								dataKey={key}
								stroke={colors[index] || colors[0] || "#8884d8"}
								strokeWidth={2}
								dot={{ fill: colors[index] || colors[0] || "#8884d8", r: 4 }}
								activeDot={{ r: 6 }}
								name={key}
							/>
						))}
					</LineChart>
				)

			case "area":
				return (
					<AreaChart {...commonProps}>
						{show_grid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
						<XAxis 
							dataKey={x_axis_key}
							tick={{ fill: 'currentColor', fontSize: 12 }}
							tickLine={{ stroke: 'currentColor' }}
							axisLine={{ stroke: 'currentColor' }}
						/>
						<YAxis 
							tick={{ fill: 'currentColor', fontSize: 12 }}
							tickLine={{ stroke: 'currentColor' }}
							axisLine={{ stroke: 'currentColor' }}
							allowDecimals={false}
						/>
						<Tooltip 
							contentStyle={{ 
								backgroundColor: '#1a1a1a',
								border: '1px solid #333',
								borderRadius: '6px',
								color: '#fff',
								padding: '8px 12px',
								boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
							}}
						/>
						{show_legend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
						{y_axis_keys.map((key, index) => (
							<Area
								key={key}
								type="monotone"
								dataKey={key}
								stackId="1"
								stroke={colors[index] || colors[0] || "#8884d8"}
								fill={colors[index] || colors[0] || "#8884d8"}
								fillOpacity={0.6}
								name={key}
							/>
						))}
					</AreaChart>
				)

			case "pie":
				return (
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							labelLine={true}
							outerRadius={100}
							fill="#8884d8"
							dataKey={y_axis_keys[0]}
							nameKey={x_axis_key}
							label={({ name, value }) => `${name}: ${value}`}
						>
							{data.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={colors[index % colors.length] || "#8884d8"} />
							))}
						</Pie>
						<Tooltip 
							contentStyle={{ 
								backgroundColor: '#1a1a1a',
								border: '1px solid #333',
								borderRadius: '6px',
								color: '#fff',
								padding: '8px 12px',
								boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
							}}
						/>
						{show_legend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
					</PieChart>
				)

			default:
				return <div className="text-center text-muted-foreground">Unsupported chart type: {chart_type}</div>
		}
	}

	return (
		<div className="bg-card border border-border rounded-lg p-4 w-full">
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-foreground">{title}</h3>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div className="w-full h-[350px]">
				<ResponsiveContainer width="100%" height="100%">
					{renderChart()}
				</ResponsiveContainer>
			</div>
		</div>
	)
}

// Utility function to determine if the response contains visualization data
const isVisualizationResponse = (response: any): boolean => {
	const hasViz = response.visualization && 
		   response.visualization.chart_type && 
		   response.visualization.data && 
		   Array.isArray(response.visualization.data) && 
		   response.visualization.data.length > 0
	
	console.log("Checking visualization:", {
		hasVisualization: hasViz,
		chartType: response.visualization?.chart_type,
		dataLength: response.visualization?.data?.length,
		responseType: response.response_type
	})
	
	return hasViz
}

export default function QueryPage() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			type: "assistant",
			content:
				"Hello! I'm your AI assistant for inventory queries. Ask me anything about your inventory data in natural language, and I'll help you find the information you need.",
			timestamp: new Date(),
		},
	])
	const [input, setInput] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	const handleSendMessage = async () => {
		if (!input.trim()) return

		const userMessage: Message = {
			id: Date.now().toString(),
			type: "user",
			content: input,
			timestamp: new Date(),
		}

		setMessages((prev) => [...prev, userMessage])
		setInput("")
		setIsLoading(true)

		try {
			const res = await axios.post("http://localhost:8000/natural-processing", {
				"query": userMessage.content
			});

			console.log("Backend Response:", res.data);

			const responseData = res.data;
			
			// Check if the response itself is the visualization data
			// Some backends might send the chart data directly, others wrap it
			let visualizationData: ChartVisualization | undefined;
			let hasVisualization = false;
			
			// Case 1: Response has a 'visualization' field
			if (responseData.visualization) {
				visualizationData = responseData.visualization;
				hasVisualization = true;
			}
			// Case 2: Response itself contains chart_type (direct format)
			else if (responseData.chart_type && responseData.data) {
				visualizationData = {
					query: responseData.query || "",
					chart_type: responseData.chart_type,
					title: responseData.title || "Chart",
					description: responseData.description || "",
					data: responseData.data,
					x_axis_key: responseData.x_axis_key,
					y_axis_keys: responseData.y_axis_keys || [],
					colors: responseData.colors || ["#8884d8"],
					show_legend: responseData.show_legend !== undefined ? responseData.show_legend : true,
					show_grid: responseData.show_grid !== undefined ? responseData.show_grid : true
				};
				hasVisualization = true;
			}

			console.log("Processed Visualization:", { hasVisualization, visualizationData });

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				type: "assistant",
				sqlQuery: responseData.query,
				content: responseData.message || "Here's your visualization:",
				timestamp: new Date(),
				results: !hasVisualization && responseData.content ? responseData.content : undefined,
				visualization: hasVisualization ? visualizationData : undefined,
			}

			setMessages((prev) => [...prev, assistantMessage])
		} catch (error) {
			console.error("Error processing query:", error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				type: "assistant",
				content: "Sorry, I encountered an error while processing your query. Please try again.",
				timestamp: new Date(),
			}
			setMessages((prev) => [...prev, errorMessage])
		}

		setIsLoading(false)

	}

	const handleSampleQuery = (query: string) => {
		setInput(query)
	}

	// Test function to add a sample visualization for debugging
	const handleTestVisualization = () => {
		const testMessage: Message = {
			id: Date.now().toString(),
			type: "assistant",
			content: "Here's a test visualization of user age distribution:",
			timestamp: new Date(),
			visualization: {
				query: "List all users age in a graph",
				chart_type: "bar",
				title: "User Age Distribution",
				description: "Distribution of user ages in the dataset.",
				data: [
					{ Age: 20, "User Count": 1 },
					{ Age: 23, "User Count": 1 },
					{ Age: 25, "User Count": 2 },
					{ Age: 28, "User Count": 3 },
					{ Age: 30, "User Count": 2 },
				],
				x_axis_key: "Age",
				y_axis_keys: ["User Count"],
				colors: ["#8884d8"],
				show_legend: false,
				show_grid: true
			}
		}
		setMessages((prev) => [...prev, testMessage])
	}

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />

			<main className="flex-1 md:ml-64 p-6">
				<div className="max-w-4xl mx-auto h-[calc(100vh-3rem)] flex flex-col">
					{/* Header */}
					<div className="mb-6">
						<h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
							<Sparkles className="h-8 w-8 text-primary" />
							Natural Query
						</h1>
						<p className="text-muted-foreground">Ask questions about your inventory in plain English</p>
					</div>

					{/* Sample Queries */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-medium text-muted-foreground">Try these sample queries:</h3>
							<Button
								variant="outline"
								size="sm"
								onClick={handleTestVisualization}
								className="text-xs"
							>
								🧪 Test Chart
							</Button>
						</div>
						<div className="flex flex-wrap gap-2">
							{sampleQueries.map((query, index) => (
								<Button
									key={index}
									variant="outline"
									size="sm"
									onClick={() => handleSampleQuery(query)}
									className="text-xs"
								>
									{query}
								</Button>
							))}
						</div>
					</div>

					{/* Chat Messages */}
					<Card className="flex-1 flex flex-col min-h-0">
						<CardHeader className="pb-4 flex-shrink-0">
							<CardTitle className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Database Query Assistant
							</CardTitle>
						</CardHeader>
						<CardContent className="flex-1 flex flex-col min-h-0">
							<div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" style={{ maxHeight: "calc(100vh - 400px)" }}>
								{messages.map((message) => (
									<div
										key={message.id}
										className={cn("flex gap-3", message.type === "user" ? "justify-end" : "justify-start")}
									>
										<div
											className={cn(
												"flex gap-3 max-w-[80%]",
												message.type === "user" ? "flex-row-reverse" : "flex-row",
											)}
										>
											<div
												className={cn(
													"flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0",
													message.type === "user"
														? "bg-primary text-primary-foreground"
														: "bg-secondary text-secondary-foreground",
												)}
											>
												{message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
											</div>
											<div className="space-y-2">
												<div
													className={cn(
														"rounded-lg px-4 py-2",
														message.type === "user"
															? "bg-primary text-primary-foreground"
															: "bg-muted text-muted-foreground",
													)}
												>
													<p className="text-sm">{message.content}</p>
												</div>

												{/* SQL Query Display */}
												{message.sqlQuery && (
													<div className="bg-card border border-border rounded-lg p-3">
														<div className="flex items-center gap-2 mb-2">
															<Database className="h-4 w-4 text-primary" />
															<span className="text-xs font-medium text-muted-foreground">Generated SQL Query</span>
														</div>
														<code className="text-xs font-mono bg-muted px-2 py-1 rounded block">
															{message.sqlQuery}
														</code>
													</div>
												)}

												{/* Chart Visualization Display */}
												{message.visualization && (
													<ChartRenderer visualization={message.visualization} />
												)}

												{/* Results Display - Table Format */}
												{message.results && message.results.length > 0 && (
													<div className="bg-card border border-border rounded-lg p-3">
														<div className="flex items-center gap-2 mb-3">
															<Badge variant="secondary" className="text-xs">
																{message.results.length} result{message.results.length !== 1 ? 's' : ''} found
															</Badge>
														</div>
														<div className="overflow-x-auto">
															<table className="w-full text-sm">
																<thead>
																	<tr className="border-b border-border">
																		{Object.keys(message.results[0]).map((key) => (
																			<th key={key} className="text-left py-2 px-3 font-medium text-muted-foreground">
																				{key}
																			</th>
																		))}
																	</tr>
																</thead>
																<tbody>
																	{message.results.map((result, index) => (
																		<tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
																			{Object.values(result).map((value: any, valueIndex) => (
																				<td key={valueIndex} className="py-2 px-3 text-foreground">
																					{value !== null && value !== undefined ? String(value) : '-'}
																				</td>
																			))}
																		</tr>
																	))}
																</tbody>
															</table>
														</div>
													</div>
												)}

												<div className="flex items-center gap-1 text-xs text-muted-foreground">
													<Clock className="h-3 w-3" />
													{message.timestamp.toLocaleTimeString()}
												</div>
											</div>
										</div>
									</div>
								))}

								{isLoading && (
									<div className="flex gap-3 justify-start">
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground">
											<Bot className="h-4 w-4" />
										</div>
										<div className="bg-muted rounded-lg px-4 py-2">
											<div className="flex items-center gap-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
												<span className="text-sm text-muted-foreground">Analyzing your query...</span>
											</div>
										</div>
									</div>
								)}
								
								{/* Scroll anchor */}
								<div ref={messagesEndRef} />
							</div>

							{/* Input Area */}
							<div className="flex gap-2">
								<Input
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Ask me anything about your inventory..."
									onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
									disabled={isLoading}
									className="flex-1"
								/>
								<Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
									<Send className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	)
}
