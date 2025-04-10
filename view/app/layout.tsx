import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./StateContext";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SEES",
  description: "Discover and explore events near you.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Google Translate script and init function */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement(
                  {
                    pageLanguage: 'en',
                    includedLanguages: 'en,fr,es,ar,pt,de,zh-CN',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                  },
                  'google_translate_element'
                );
              }
            `,
          }}
        />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <AppProvider>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </AppRouterCacheProvider>
        </AppProvider>
      </body>
    </html>
  );
}
