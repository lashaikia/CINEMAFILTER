
import React from 'react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  viewMode?: 'grid' | 'list';
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onClick(movie)}
        className="flex gap-4 bg-[#111827]/40 rounded-xl overflow-hidden border border-white/5 cursor-pointer hover:bg-white/5 transition-all p-3"
      >
        <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden">
          <img src={movie.posterUrl} className="w-full h-full object-cover" alt={movie.title} />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1">
          <h3 className="text-sm font-bold text-white line-clamp-1">{movie.title}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{movie.year} • {movie.genres.slice(0, 2).join(', ')}</p>
          <div className="flex gap-3 items-center mt-1">
            <span className="text-[10px] flex items-center gap-1 text-yellow-500 font-bold">
              <i className="fab fa-imdb text-xs"></i> {movie.imdbRating?.toFixed(1) || 'N/A'}
            </span>
            <span className="text-[10px] flex items-center gap-1 text-cyan-400 font-bold">
              <i className="fas fa-star text-[8px]"></i> {movie.tmdbRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(movie)}
      className="group relative bg-[#111827]/40 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)] border border-white/5"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060910] via-transparent to-transparent opacity-90" />
        
        {/* Rating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
            <i className="fab fa-imdb text-yellow-500 text-[10px]"></i>
            <span className="text-[10px] font-black">{movie.imdbRating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
            <i className="fas fa-star text-cyan-500 text-[8px]"></i>
            <span className="text-[10px] font-black">{movie.tmdbRating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1">
        <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">{movie.year}</p>
        <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {movie.title}
        </h3>
      </div>
    </div>
  );
};

export default MovieCard;
