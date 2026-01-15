
import React, { useState, useEffect, useCallback } from 'react';
import { FilterState, Movie, GENRES, COUNTRIES } from './types';
import { fetchMovies } from './services/geminiService';
import MovieCard from './components/MovieCard';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    genres: [],
    countries: [],
    years: [1980, 2025],
    minRating: 0,
    mood: '',
    page: 1,
    sortBy: 'popularity.desc',
    viewMode: 'grid'
  });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cinepro_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const performSearch = useCallback(async (currentFilters: FilterState) => {
    if (showOnlyFavorites) return;
    setLoading(true);
    try {
      const response = await fetchMovies(currentFilters);
      setMovies(response.movies);
      setTotalPages(response.totalPages);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [showOnlyFavorites]);

  useEffect(() => {
    performSearch(filters);
  }, [filters.page, filters.sortBy]);

  const handleApply = () => {
    setShowFilters(false);
    setShowOnlyFavorites(false);
    setFilters(prev => ({ ...prev, page: 1 }));
    performSearch({...filters, page: 1});
  };

  const handleReset = () => {
    const initialFilters: FilterState = {
      searchQuery: '',
      genres: [],
      countries: [],
      years: [1980, 2025],
      minRating: 0,
      mood: '',
      page: 1,
      sortBy: 'popularity.desc',
      viewMode: filters.viewMode
    };
    setFilters(initialFilters);
    setShowFilters(false);
    setShowOnlyFavorites(false);
    setSelectedMovie(null);
    performSearch(initialFilters);
  };

  const toggleFavorite = (movie: Movie) => {
    const newFavs = favorites.some(f => f.id === movie.id)
      ? favorites.filter(f => f.id !== movie.id)
      : [...favorites, movie];
    setFavorites(newFavs);
    localStorage.setItem('cinepro_favorites', JSON.stringify(newFavs));
  };

  const toggleList = (list: string[], item: string) => 
    list.includes(item) ? list.filter(i => i !== item) : [...list, item];

  const displayedMovies = showOnlyFavorites ? favorites : movies;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 font-['Fira_GO'] pb-20">
      <header className="sticky top-0 z-50 bg-[#060910]/98 backdrop-blur-3xl border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0 cursor-pointer group" onClick={handleReset}>
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:rotate-12 transition-transform">
                <i className="fas fa-film text-black"></i>
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">ფილისაძიებო</h1>
            </div>
            
            {/* Search */}
            <div className="flex-1 w-full relative">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input
                type="text"
                placeholder="მოძებნე ფილმი..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3.5 pl-14 pr-6 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              />
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <button 
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`h-11 px-4 rounded-xl border border-white/10 font-bold flex items-center gap-2 transition-all shrink-0 ${showOnlyFavorites ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-slate-400'}`}
              >
                <i className="fas fa-heart text-xs"></i>
                <span className="text-[10px] uppercase font-black tracking-widest hidden sm:inline">ფავორიტები</span>
              </button>

              <select 
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value, page: 1})}
                className="h-11 px-3 bg-slate-900 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:border-cyan-500 cursor-pointer shrink-0"
              >
                <option value="popularity.desc">პოპულარობა</option>
                <option value="vote_average.desc">რეიტინგი</option>
                <option value="primary_release_date.desc">უახლესი</option>
                <option value="primary_release_date.asc">ძველი</option>
              </select>

              <button 
                onClick={() => setFilters(prev => ({...prev, viewMode: prev.viewMode === 'grid' ? 'list' : 'grid'}))}
                className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-500 transition-colors shrink-0"
              >
                <i className={`fas fa-${filters.viewMode === 'grid' ? 'list' : 'th-large'} text-xs`}></i>
              </button>

              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`h-11 px-5 rounded-xl border border-white/10 font-bold flex items-center gap-2 transition-all shrink-0 ${showFilters ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-slate-400'}`}
              >
                <i className="fas fa-sliders-h text-xs"></i>
                <span className="text-[10px] uppercase tracking-[0.2em] hidden sm:inline">ფილტრები</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl animate-in slide-in-from-top duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex justify-between">
                    ჟანრები <span>({filters.genres.length})</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar bg-black/20 p-3 rounded-xl border border-white/5">
                    {GENRES.map(g => (
                      <button 
                        key={g} 
                        onClick={() => setFilters({...filters, genres: toggleList(filters.genres, g)})}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${filters.genres.includes(g) ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/20'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex justify-between">
                    ქვეყანა <span>({filters.countries.length})</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar bg-black/20 p-3 rounded-xl border border-white/5">
                    {Object.entries(COUNTRIES).map(([code, name]) => (
                      <button 
                        key={code} 
                        onClick={() => setFilters({...filters, countries: toggleList(filters.countries, code)})}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${filters.countries.includes(code) ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-800 border-white/5 text-slate-400'}`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">წლების ინტერვალი</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min="1900" max="2025" value={filters.years[0]} onChange={e => setFilters({...filters, years: [parseInt(e.target.value), filters.years[1]]})} className="w-full bg-slate-800 border border-white/5 rounded-lg p-2.5 text-[10px] text-white focus:border-cyan-500 outline-none" />
                      <span className="text-slate-600">-</span>
                      <input type="number" min="1900" max="2025" value={filters.years[1]} onChange={e => setFilters({...filters, years: [filters.years[0], parseInt(e.target.value)]})} className="w-full bg-slate-800 border border-white/5 rounded-lg p-2.5 text-[10px] text-white focus:border-cyan-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">მინ. რეიტინგი: {filters.minRating}+</label>
                    <input type="range" min="0" max="10" step="0.5" value={filters.minRating} onChange={e => setFilters({...filters, minRating: parseFloat(e.target.value)})} className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-end">
                  <button onClick={handleReset} className="w-full h-10 border border-white/10 text-slate-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-white/5">
                    ფილტრების გასუფთავება
                  </button>
                  <button onClick={handleApply} className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-black font-black rounded-xl uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-cyan-500/10 transition-all active:scale-95">
                    შედეგების ნახვა
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10 min-h-[60vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse text-center">იტვირთება მონაცემები...</p>
          </div>
        ) : displayedMovies.length > 0 ? (
          <>
            <div className={filters.viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6" : "flex flex-col gap-3 max-w-4xl mx-auto"}>
              {displayedMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} viewMode={filters.viewMode} />
              ))}
            </div>

            {!showOnlyFavorites && totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 1} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:border-cyan-500 transition-colors">
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-4 h-10">
                  <span className="text-[10px] font-black text-cyan-500 tracking-widest">{filters.page}</span>
                  <span className="text-[10px] font-black text-slate-600 px-1">/</span>
                  <span className="text-[10px] font-black text-slate-400 tracking-widest">{totalPages}</span>
                </div>
                <button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page === totalPages} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:border-cyan-500 transition-colors">
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-40">
            <i className="fas fa-ghost text-4xl text-slate-800 mb-4 block"></i>
            <p className="text-slate-500 text-sm font-medium">ფილმები ვერ მოიძებნა</p>
            <button onClick={handleReset} className="mt-4 text-cyan-500 text-[10px] font-black uppercase tracking-widest hover:underline">საწყის გვერდზე დაბრუნება</button>
          </div>
        )}
      </main>

      {selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-[#0b101a] border border-white/10 rounded-[2.5rem] max-w-5xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl relative my-8">
            <button onClick={() => setSelectedMovie(null)} className="absolute top-6 right-6 z-50 w-11 h-11 bg-black/50 rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-red-500 transition-all">
              <i className="fas fa-times"></i>
            </button>
            <div className="md:w-1/3 shrink-0">
              <img src={selectedMovie.posterUrl} className="w-full h-full object-cover min-h-[400px]" alt={selectedMovie.title} />
            </div>
            <div className="md:w-2/3 p-8 md:p-14 space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-yellow-500/10">
                  <i className="fab fa-imdb text-xl"></i> {selectedMovie.imdbRating?.toFixed(1) || 'N/A'}
                </div>
                <div className="bg-white/5 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl font-black flex items-center gap-2">
                  <i className="fas fa-star text-xs"></i> {selectedMovie.tmdbRating.toFixed(1)} <span className="text-[8px] opacity-50 font-medium tracking-tight">TMDB</span>
                </div>
                <button onClick={() => toggleFavorite(selectedMovie)} className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${favorites.some(f => f.id === selectedMovie.id) ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  <i className="fas fa-heart"></i>
                </button>
                <span className="bg-white/5 text-slate-400 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">{selectedMovie.year}</span>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 leading-[1.1]">{selectedMovie.title}</h2>
                <p className="text-slate-500 text-xl italic font-medium tracking-tight opacity-80">{selectedMovie.originalTitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMovie.genres.map(g => <span key={g} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">{g}</span>)}
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] text-cyan-500 uppercase font-black tracking-[0.2em] border-b border-cyan-500/20 pb-1.5 inline-block">ფილმის სიუჟეტი</h4>
                <p className="text-slate-300 text-xl leading-relaxed font-light">{selectedMovie.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-10 py-8 border-y border-white/5">
                <div><h4 className="text-[10px] text-slate-500 uppercase font-black mb-1.5 tracking-widest">რეჟისორი</h4><p className="font-bold text-white text-lg">{selectedMovie.director}</p></div>
                <div><h4 className="text-[10px] text-slate-500 uppercase font-black mb-1.5 tracking-widest">როლებში</h4><p className="text-slate-400 text-xs leading-loose">{selectedMovie.cast.join(', ')}</p></div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-4 pb-4">
                <a href={selectedMovie.imdbUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-yellow-500 text-black font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] hover:bg-yellow-400 transition-all">
                  <i className="fab fa-imdb text-2xl"></i> პროფილი
                </a>
                <a href={selectedMovie.trailerUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-red-600 text-white font-black py-4.5 rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] hover:bg-red-500 transition-all shadow-xl shadow-red-600/10">
                  <i className="fab fa-youtube text-2xl"></i> თრეილერი
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
