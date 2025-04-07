"use client";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
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
    <Box
    sx={{
      width: '100%',
      maxWidth: 500,
      mx: 'auto',
      mt: 4,
      px: 2,
    }}
  >
    <Paper
      component="form"
      onSubmit={handleSearchSubmit}
      elevation={3}
      sx={{
        p: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '30px',
        backgroundColor: '#f5f5f5',
      }}
    >
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search anything..."
        inputProps={{ 'aria-label': 'search anything' }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </Paper>
  </Box>
  );
};

export default SearchBar;
