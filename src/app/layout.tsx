import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const previewImage = "/og-invitation-v2.jpg";

export const metadata: Metadata = {
  metadataBase: new URL("https://vuduyanh.id.vn"),
  title: {
    default: "Thiệp mời tốt nghiệp PTIT",
    template: "%s | Thiệp mời PTIT",
  },
  description: "Thiệp mời dự lễ tốt nghiệp của Vũ Duy Anh tại PTIT.",
  openGraph: {
    title: "Thiệp mời tốt nghiệp PTIT",
    description: "Mời bạn tới dự lễ tốt nghiệp của Vũ Duy Anh tại PTIT.",
    url: "https://vuduyanh.id.vn",
    siteName: "Thiệp mời PTIT",
    images: [
      {
        url: previewImage,
        secureUrl: previewImage,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Thiệp mời tốt nghiệp PTIT",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thiệp mời tốt nghiệp PTIT",
    description: "Mời bạn tới dự lễ tốt nghiệp của Vũ Duy Anh tại PTIT.",
    images: [previewImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
