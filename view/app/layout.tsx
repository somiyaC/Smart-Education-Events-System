import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/NavBar";
import SearchBar from "@/app/components/SearchBar";
import SideBarNavBar from "@/app/components/SideBarNavBar";
import Footer from "@/app/components/Footer";
import { AppProvider } from "./StateContext";

export const metadata: Metadata = {
  title: "SEES",
  description: "Discover and explore events near you.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Navbar />
          <SearchBar />
          <div className="flex flex-grow">
            <SideBarNavBar />
            <main className="flex-grow p-6">{children}</main>
          </div>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
