import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConsultationProvider } from "@/components/consultation/ConsultationProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qualisapio — AI Peer Review for Authors and Reviewers",
  description:
    "Structured peer-review feedback and reviewer assistance for qualitative manuscripts—for authors before submission and reviewers during assessment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ConsultationProvider>{children}</ConsultationProvider>
      </body>
    </html>
  );
}
