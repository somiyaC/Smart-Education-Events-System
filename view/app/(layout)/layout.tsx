"use client";

import Navbar from "@/app/(layout)/components/NavBar";
import SearchBar from "@/app/(layout)/components/SearchBar";
import SideBarNavBar from "@/app/(layout)/components/SideBarNavBar";
import Footer from "@/app/(layout)/components/Footer";
import Script from "next/script";

export default function WithLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Google Translate Script */}
      <Script
        id="google-translate"
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

      <div className="flex flex-col min-h-screen">
        <header>
          <Navbar />
          <SearchBar />
        </header>

        <div className="flex flex-grow relative">
          <aside className="w-64 flex-shrink-0">
            <SideBarNavBar />
          </aside>
          <main className="flex-grow p-4">{children}</main>
        </div>

        <div className="relative z-20">
          <Footer />
        </div>
      </div>
    </>
  );
}
