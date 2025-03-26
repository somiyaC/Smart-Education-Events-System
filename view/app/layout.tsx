"use client"; // Mark this as a client component
import "./globals.css";
import Navbar from "@/app/components/NavBar";
import SearchBar from "@/app/components/SearchBar";
import SideBarNavBar from "@/app/components/SideBarNavBar";
import Footer from "@/app/components/Footer";
import { useState } from "react"; // Import useState

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Function to handle search query
  const handleSearch = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  return (
    <html lang="en">
      <body>
        <Navbar />
        {/* Pass the handleSearch function to SearchBar */}
        <SearchBar onSearch={handleSearch} />
        <div className="flex flex-grow">
          <SideBarNavBar />
          <main className="flex-grow p-6">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
