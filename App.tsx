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
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    performSearch(newFilters);
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

  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    
    const newFilters = { ...filters, genres: newGenres, page: 1 };
    setFilters(newFilters);
    performSearch(newFilters);
  };

  const displayedMovies = showOnlyFavorites ? favorites : movies;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-['Fira_GO'] pb-20">
      <header className="sticky top-0 z-50 bg-[#020617]/95 backdrop-blur-3xl border-b border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-5 items-center">
            <div className="flex items-center gap-4 shrink-0 cursor-pointer group" onClick={handleReset}>
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <i className="fas fa-film text-white text-xl"></i>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">ფილისაძიებო</h1>
            </div>
            
            <div className="flex-1 w-full relative">
              <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="ჩაწერე ფილმის სახელი..."
                className="w-full bg-slate-900/80 border border-white/20 rounded-2xl py-4.5 pl-16 pr-6 focus:outline-none focus:border-indigo-500 transition-all text-[16px] shadow-2xl text-white"
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              />
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button 
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`h-12 px-6 rounded-2xl border border-white/10 font-bold flex items-center gap-3 transition-all shrink-0 ${showOnlyFavorites ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-lg' : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'}`}
              >
                <i className="fas fa-heart"></i>
                <span className="text-[11px] uppercase font-black tracking-[0.2em] hidden sm:inline">რჩეულები</span>
              </button>

              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`h-12 px-6 rounded-2xl border border-white/10 font-bold flex items-center gap-3 transition-all shrink-0 ${showFilters ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-lg' : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'}`}
              >
                <i className="fas fa-filter"></i>
                <span className="text-[11px] uppercase tracking-[0.2em] hidden sm:inline">ფილტრები</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5 px-1">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">აირჩიე ჟანრი:</span>
              {filters.genres.length > 0 && (
                <button onClick={() => { setFilters({...filters, genres: [], page: 1}); performSearch({...filters, genres: [], page: 1}); }} className="text-[10px] font-black text-rose-500 uppercase hover:text-rose-400 transition-colors flex items-center gap-2">
                  <i className="fas fa-times"></i> გასუფთავება
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`genre-chip px-5 py-3 rounded-xl text-[14px] font-bold border tracking-wide transition-all ${
                    filters.genres.includes(genre)
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800/40 border-white/10 text-slate-200 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-16 min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.5em]">იტვირთება...</p>
          </div>
        ) : displayedMovies.length > 0 ? (
          <div className={filters.viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10" : "flex flex-col gap-6 max-w-4xl mx-auto"}>
            {displayedMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} viewMode={filters.viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-slate-900/30 rounded-[4rem] border border-white/5">
            <p className="text-slate-300 text-xl font-bold">ფილმები ვერ მოიძებნა</p>
          </div>
        )}
      </main>

      {selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/98 backdrop-blur-3xl overflow-y-auto custom-scrollbar">
          <div className="bg-[#0f172a] border border-white/15 rounded-[3.5rem] max-w-6xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl relative my-8">
            <button onClick={() => setSelectedMovie(null)} className="absolute top-8 right-8 z-50 w-14 h-14 bg-black/50 rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-rose-600 transition-all">
              <i className="fas fa-times text-lg"></i>
            </button>
            <div className="md:w-1/3 shrink-0">
              <img src={selectedMovie.posterUrl} className="w-full h-full object-cover min-h-[550px]" alt={selectedMovie.title} />
            </div>
            <div className="md:w-2/3 p-12 md:p-20 space-y-12">
              <h2 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tighter">{selectedMovie.title}</h2>
              <p className="text-slate-400 text-2xl italic font-medium">{selectedMovie.originalTitle}</p>
              <div className="flex flex-wrap gap-3">
                {selectedMovie.genres.map(g => <span key={g} className="px-5 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-[13px] font-bold text-indigo-300 uppercase tracking-wide">{g}</span>)}
              </div>
              <p className="text-slate-100 text-2xl leading-relaxed font-light">{selectedMovie.description}</p>
              <div className="flex flex-col sm:flex-row gap-6 pt-10">
                <a href={selectedMovie.imdbUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-5 uppercase text-[12px] tracking-[0.2em] transition-all"> IMDB </a>
                <a href={selectedMovie.trailerUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-5 uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl"> თრეილერი </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;