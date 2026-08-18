'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchSuggestions } from '@/lib/data';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  size?: 'md' | 'lg';
}

export default function SearchBar({
  placeholder = 'Search for courses, topics, or instructors...',
  onSearch,
  className,
  size = 'lg',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    inputRef.current?.focus();
  };

  const showDropdown = isFocused && query.length === 0;
  const filtered = isFocused && query.length > 0
    ? searchSuggestions.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className={cn('relative w-full', className)}>
      {/* ── Input Wrapper ── */}
      <div
        className={cn(
          'flex items-center gap-2 w-full',
          'bg-dark-700/80 backdrop-blur-md',
          'border rounded-2xl',
          'transition-all duration-300',
          isFocused
            ? 'border-primary-500/70 shadow-[0_0_0_3px_rgba(124,58,237,0.15)]'
            : 'border-white/10 hover:border-white/20',
          size === 'lg' ? 'px-5 py-4' : 'px-4 py-3'
        )}
      >
        <Search
          className={cn(
            'flex-shrink-0 transition-colors duration-200',
            size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
            isFocused ? 'text-primary-400' : 'text-slate-500'
          )}
        />
        <input
          ref={inputRef}
          id="course-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search courses"
          className={cn(
            'flex-1 bg-transparent outline-none',
            'text-slate-100 placeholder:text-slate-500',
            'font-sans',
            size === 'lg' ? 'text-base' : 'text-sm'
          )}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleSearch}
          className={cn(
            'flex items-center gap-2 flex-shrink-0',
            'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
            'text-white font-semibold',
            'rounded-xl transition-all duration-200',
            'shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50',
            size === 'lg' ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-xs'
          )}
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* ── Dropdown: Suggestions (empty query) ── */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl border border-white/10 p-3 z-50 shadow-2xl shadow-black/50">
          <p className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2 px-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            Popular searches
          </p>
          <div className="flex flex-wrap gap-2">
            {searchSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-primary-500/20 border border-white/8 hover:border-primary-500/30 px-3 py-1.5 rounded-full transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Dropdown: Filtered results ── */}
      {filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl border border-white/10 overflow-hidden z-50 shadow-2xl shadow-black/50">
          {filtered.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-primary-500/10 transition-colors duration-150"
            >
              <Search className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
