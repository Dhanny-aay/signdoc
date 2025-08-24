import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "signdoc",
  description: "Document management and signing system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased bg-white text-gray-900`}>
        <Toaster richColors position="top-center" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
