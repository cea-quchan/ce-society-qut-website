import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'جستجو...' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-[#1a1a1a] dark:bg-white text-[#00ff99] dark:text-[#1a1a1a] border border-[#00ff99] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ff99]"
        />
        <button
          type="submit"
          title="جستجو"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#00ff99] hover:text-[#00cc7a]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </motion.div>
    </form>
  );
};

export default SearchBar; 