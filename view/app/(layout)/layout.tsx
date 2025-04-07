import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/app/(layout)/components/NavBar";
import SearchBar from "@/app/(layout)/components/SearchBar";
import SideBarNavBar from "@/app/(layout)/components/SideBarNavBar";
import Footer from "@/app/(layout)/components/Footer";
import { AppProvider } from "../StateContext";

export const metadata: Metadata = {
  title: "SEES",
  description: "Discover and explore events near you.",
};

export default function WithLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed header section */}
      <header>
        <Navbar />
        <SearchBar />
      </header>

      {/* Main content with sidebar */}
      <div className="flex flex-grow relative">
        <aside className="w-64 flex-shrink-0">
          <SideBarNavBar />
        </aside>
        <main className="flex-grow p-4">{children}</main>
      </div>

      {/* Footer at the bottom with higher z-index */}
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
