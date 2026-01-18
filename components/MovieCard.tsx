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
        className="flex gap-6 bg-slate-900/60 rounded-3xl overflow-hidden border border-white/10 cursor-pointer hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all p-5 shadow-lg group"
      >
        <div className="w-28 h-40 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
          <img src={movie.posterUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={movie.title} />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-3">
          <h3 className="text-2xl font-black text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">{movie.title}</h3>
          <p className="text-[12px] text-slate-300 uppercase font-black tracking-[0.2em]">{movie.year} • {movie.genres.slice(0, 2).join(', ')}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(movie)}
      className="group relative bg-[#0f172a] rounded-[2.5rem] overflow-hidden cursor-pointer transform transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.3)] border border-white/10"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-95" />
        <div className="absolute top-5 left-5 flex flex-col gap-2.5">
          <div className="bg-black/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2.5 shadow-2xl">
            <i className="fab fa-imdb text-amber-400 text-[18px]"></i>
            <span className="text-[13px] font-black text-white">{movie.imdbRating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
        <p className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.3em]">{movie.year}</p>
        <h3 className="text-[18px] font-black text-white leading-[1.3] line-clamp-2 group-hover:text-indigo-400 transition-colors tracking-tight">
          {movie.title}
        </h3>
      </div>
    </div>
  );
};

export default MovieCard;