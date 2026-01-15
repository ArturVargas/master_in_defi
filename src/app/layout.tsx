import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { FarcasterProvider } from "@/contexts/FarcasterContext";
import { SelfProvider } from "@/contexts/SelfContext";
import { VerificationProvider } from "@/contexts/VerificationContext";

// Fuentes comentadas temporalmente para evitar errores en build sin red
// Se pueden habilitar cuando haya acceso a internet
// import { Geist, Geist_Mono } from "next/font/google";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// Configuración del embed para Farcaster Mini App
const farcasterEmbed = {
  version: "1",
  imageUrl: "https://masterendefi.lat/master_defi_banner.png",
  button: {
    title: "Comenzar a aprender",
    action: {
      type: "launch_miniapp",
      name: "Master En DeFi",
      url: "https://masterendefi.lat/",
      splashImageUrl: "https://masterendefi.lat/splash.png",
      splashBackgroundColor: "#000000"
    }
  }
}

export const metadata: Metadata = {
  title: "DeFi Learning Quiz | Aprende sobre protocolos DeFi",
  description: "Aprende sobre protocolos DeFi de manera interactiva con nuestro quiz educativo",
  other: {
    // Meta tag para Farcaster Mini App embeds
    'fc:miniapp': JSON.stringify(farcasterEmbed),
    // Backward compatibility con legacy frames
    'fc:frame': JSON.stringify({
      ...farcasterEmbed,
      button: {
        ...farcasterEmbed.button,
        action: {
          ...farcasterEmbed.button.action,
          type: "launch_frame" // Legacy type
        }
      }
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <FarcasterProvider>
            <SelfProvider>
              <VerificationProvider>
                {children}
              </VerificationProvider>
            </SelfProvider>
          </FarcasterProvider>
        </Providers>
      </body>
    </html>
  );
}
