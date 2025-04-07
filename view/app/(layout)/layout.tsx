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
        <>
          <Navbar />
          <SearchBar />
          <div className="flex flex-grow">
            <SideBarNavBar />
            {children}
          </div>
          <Footer />
        </>
  );
}
