"use client";
import React, { useState } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex items-center justify-center mb-6 w-full max-w-2xl mx-auto mt-6">
      {/* Event Search Input */}
      <div className="flex items-center bg-[#F5F5F5] border border-orange-400 rounded-full w-1/2 px-4 py-2 shadow-sm">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search Events"
          className="w-full bg-[#F5F5F5] outline-none text-gray-700"
        />
      </div>
    </div>
  );
};

export default SearchBar;
