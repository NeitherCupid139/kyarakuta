import type { Metadata } from "next";

import "./globals.css";
import "98.css";

// 导入字体样式
import localFont from "next/font/local";
import Navbar from "./components/Navbar";
import { WallpaperProvider } from "./components/context/WallpaperContext";

// 加载本地字体
const msFont = localFont({
	src: "../public/fonts/MSW98UI-Regular.woff",
	variable: "--ms-font",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Kyarakuta",
	description: "Create your own story~",
	icons: {
		icon: "/public/icons/myfriend.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={msFont.variable}>
			<body
				style={{ overflow: "hidden", fontFamily: "var(--ms-font)" }}
				className="relative"
			>
				<WallpaperProvider>
					{children}
					<Navbar />
				</WallpaperProvider>
			</body>
		</html>
	);
}
