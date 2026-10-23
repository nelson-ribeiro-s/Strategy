import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Prezensa Management System",
  description: "Cockpit executivo, Scorecard, Rocks, Issues e L1 da Prezensa."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
