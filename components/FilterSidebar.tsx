import React from 'react';
import { FilterState, GENRES } from '../types';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onApply: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onApply }) => {
  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    onFilterChange({ ...filters, genres: newGenres, page: 1 });
  };

  return (
    <div className="flex flex-col gap-8 p-10 bg-[#0f172a] backdrop-blur-3xl rounded-[3rem] border border-white/10 h-full overflow-hidden shadow-2xl relative">
      <div className="flex flex-col h-full relative z-10">
        <h3 className="text-2xl font-black text-white mb-8"> ფილტრაცია </h3>
        <div className="space-y-10 flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div>
            <label className="text-[11px] font-black text-slate-300 uppercase block mb-5">საკვანძო სიტყვა</label>
            <input
              type="text"
              placeholder="მაგ: კრისტოფერ ნოლანი..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value, page: 1 })}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4.5 text-[15px] focus:outline-none focus:border-indigo-500 transition-all text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-300 uppercase block mb-5">ჟანრები</label>
            <div className="grid grid-cols-2 gap-3.5">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`text-[14px] text-left py-4 px-5 rounded-2xl border transition-all truncate font-bold tracking-wide ${
                    filters.genres.includes(genre)
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-800/40 border-white/5 text-slate-200 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-10 mt-8 border-t border-white/10">
          <button
            onClick={onApply}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5.5 rounded-[2rem] transition-all text-[13px] uppercase tracking-[0.3em] shadow-lg shadow-indigo-600/20"
          >
            განახლება
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
