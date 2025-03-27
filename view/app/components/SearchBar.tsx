"use client";
import React, { useState } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { useRouter,useSearchParams } from "next/navigation";

const SearchBar: React.FC = () => {

  const search = useSearchParams();
  const search_query = search.get('q') || "";
  const [searchQuery, setSearchQuery] = useState(search_query);
  const router = useRouter();
  const handleSearchSubmit = (e: React.FormEvent) => {
    router.push("/?q=" + searchQuery);
  };

  return (
    <div className="flex items-center justify-center mb-6 w-full max-w-2xl mx-auto mt-6">
      {/* Event Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#F5F5F5] border border-orange-400 rounded-full w-1/2 px-4 py-2 shadow-sm">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search Events"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#F5F5F5] outline-none text-gray-700"
        />
      </form>
    </div>
  );
};

export default SearchBar;
