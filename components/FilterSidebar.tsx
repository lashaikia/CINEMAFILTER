
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

  const clearGenres = () => {
    onFilterChange({ ...filters, genres: [], page: 1 });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 h-full overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <i className="fas fa-sliders-h text-cyan-500"></i>
            ფილტრაცია
          </h3>
          {filters.genres.length > 0 && (
            <button 
              onClick={clearGenres}
              className="text-[10px] text-slate-500 hover:text-cyan-400 uppercase tracking-tighter transition-colors"
            >
              გასუფთავება
            </button>
          )}
        </div>
        
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {/* Search Keywords */}
          <div>
            <label className="text-sm font-medium text-slate-400 block mb-3">საკვანძო სიტყვები</label>
            <input
              type="text"
              placeholder="მაგ: ნოლანი, ოსკარი..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value, page: 1 })}
              className="w-full bg-slate-800/50 border border-white/5 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Genres */}
          <div>
            <label className="text-sm font-medium text-slate-400 block mb-3">ჟანრები</label>
            <div className="grid grid-cols-2 gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`text-[10px] text-left py-2 px-3 rounded-lg border transition-all truncate ${
                    filters.genres.includes(genre)
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold'
                      : 'bg-slate-800/50 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                  title={genre}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-medium text-slate-400 block mb-3">
              მინიმალური რეიტინგი: <span className="text-cyan-400 font-bold">{filters.minRating}</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => onFilterChange({ ...filters, minRating: parseFloat(e.target.value), page: 1 })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="text-sm font-medium text-slate-400 block mb-3">განწყობა / თემატიკა</label>
            <input
              type="text"
              placeholder="მაგ: კოსმოსი, შურისძიება..."
              value={filters.mood}
              onChange={(e) => onFilterChange({ ...filters, mood: e.target.value, page: 1 })}
              className="w-full bg-slate-800/50 border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-white/5">
          <button
            onClick={onApply}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <i className="fas fa-sync-alt text-xs"></i>
            შედეგების განახლება
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
