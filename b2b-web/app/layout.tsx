import { Inter, Playfair_Display } from "next/font/google";
import { ReactNode } from "react";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif"
});

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} bg-botanical-bg font-sans text-botanical-text`}>
        {children}
      </body>
    </html>
  );
}
