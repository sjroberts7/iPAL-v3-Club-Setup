import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
export const metadata: Metadata = {
  title: "iPAL · Create Club",
  description: "Interactive iPAL club creation demonstration",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
