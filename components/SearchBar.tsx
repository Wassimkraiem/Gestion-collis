'use client';

import { useState } from 'react';
import { Search, Calendar } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, type: string, startDate?: string, endDate?: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, searchType, startDate || undefined, endDate || undefined);
  };

  const handleClear = () => {
    setQuery('');
    setSearchType('all');
    setStartDate('');
    setEndDate('');
    onSearch('', 'all', undefined, undefined);
  };

  const hasFilters = query || startDate || endDate;

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="relative group md:col-span-4">
            <Search
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un colis..."
              className="input pl-14 text-base w-full"
            />
          </div>

          {/* Search Type */}
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

          {/* Date Filters */}
          <div className="flex gap-2 md:col-span-4">
            <div className="relative flex-1 group">
              <Calendar
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input pl-10 text-sm w-full"
                max={endDate || undefined}
                title="Date de début"
              />
            </div>
            <div className="relative flex-1 group">
              <Calendar
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input pl-10 text-sm w-full"
                min={startDate || undefined}
                title="Date de fin"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="btn-primary whitespace-nowrap flex items-center justify-center gap-2 md:col-span-1"
          >
            <Search size={18} />
            <span className="hidden lg:inline">Rechercher</span>
          </button>

          {/* Clear Button */}
          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary whitespace-nowrap flex items-center justify-center gap-2 md:col-span-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden lg:inline">Effacer</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

