'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, type: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, searchType);
  };

  const handleClear = () => {
    setQuery('');
    setSearchType('all');
    onSearch('', 'all');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 animate-fadeIn">
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative group md:col-span-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un colis..."
              className="input pl-12 text-base w-full"
            />
            <Search className="absolute left-4 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          </div>
          
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="input cursor-pointer text-sm md:col-span-2"
          >
            <option value="all">🔍 Tous</option>
            <option value="reference">📦 Référence</option>
            <option value="client">👤 Client</option>
            <option value="tel">📞 Téléphone</option>
            <option value="numero">🔢 N° Colis</option>
          </select>

          <button
            type="submit"
            className="btn-primary whitespace-nowrap flex items-center justify-center gap-2 md:col-span-2"
          >
            <Search size={18} />
            <span>Rechercher</span>
          </button>

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary whitespace-nowrap flex items-center justify-center gap-2 md:col-span-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Effacer</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

