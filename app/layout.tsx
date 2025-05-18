import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";
import { AuthProvider } from "@/contexts/auth-context";
import { DataProvider } from "@/contexts/data-context";
import { NavigationProvider } from "@/contexts/navigation-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CharityTrack",
  description: "Donation tracking and management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <DataProvider>
            <NavigationProvider>
              <ClientLayout>{children}</ClientLayout>
            </NavigationProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
