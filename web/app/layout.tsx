import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { AuthProvider } from "@/contexts/auth-context";


export const metadata: Metadata = {
	title: "Inventory Management System",
	description: "Manage your inventory with role-based access control",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>
						{children}
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
