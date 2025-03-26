"use client";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchQuery); // Trigger search when Enter is pressed
    }
  };

  const handleSubmit = () => {
    onSearch(searchQuery); // Trigger search on button click as well
  };

  return (
    <div className="flex items-center justify-center mb-6 w-full max-w-2xl mx-auto mt-6">
      {/* Event Search Input */}
      <div className="flex items-center border border-orange-400 rounded-full w-1/2 px-4 py-2 shadow-sm">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search Events"
          className="w-full outline-none text-gray-700"
          value={searchQuery}
          onChange={handleChange}
          onKeyPress={handleKeyPress} // Listen for Enter key press
        />
        <button
          type="button"
          onClick={handleSubmit} // Trigger search when clicked
          className="ml-2 bg-orange-300 text-xs text-white px-3 py-2 rounded-full"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
