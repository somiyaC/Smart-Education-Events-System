"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, InputBase, Paper, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto mt-4 mb-6">
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center border border-orange-300 rounded-full w-full px-4 py-2 bg-white transition-all focus-within:border-orange-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-orange-400 mr-3"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search Events"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full outline-none text-gray-700 placeholder-gray-400"
        />
      </form>
    </div>
  );
};

export default SearchBar;
