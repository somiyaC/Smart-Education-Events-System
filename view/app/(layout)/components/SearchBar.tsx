"use client";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

const SearchBar: React.FC = () => {
  const search = useSearchParams();
  const search_query = search.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(search_query);
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/?q=" + searchQuery);
  };

  return (
    <div className="flex items-center justify-center mb-6 w-full max-w-2xl mx-auto mt-6">
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center border border-orange-400 rounded-full w-8/9 px-4 py-2"
      >
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search Events"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full outline-none text-gray-700"
        />
      </form>
    </div>
  );
};

export default SearchBar;
