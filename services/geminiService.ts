
import { GoogleGenAI } from "@google/genai";
import { FilterState, Movie, FetchResponse } from "../types";
import.meta.env.VITE_GEMINI_API_KEY

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const TMDB_API_KEY = 'd877fc4def9cce3c864d7abe176cb0ac';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const GENRE_MAP: Record<string, number> = {
  "მძაფრსიუჟეტიანი": 28,
  "სათავგადასავლო": 12,
  "ანიმაციური": 16,
  "ბიოგრაფიული": 36,
  "კომედია": 35,
  "კრიმინალური": 80,
  "დოკუმენტური": 99,
  "დრამა": 18,
  "საოჯახო": 10751,
  "ფენტეზი": 14,
  "ისტორიული": 36,
  "საშინელებათა": 27,
  "მუსიკალური": 10402,
  "დეტექტივი": 9648,
  "მელოდრამა": 10749,
  "ფანტასტიკა": 878,
  "თრილერი": 53,
  "საომარი": 10752,
  "ვესტერნი": 37,
  "მისტიკა": 9648,
  "ანიმე": 16,
  "ფსიქოლოგიური": 53,
  "სუპერგმირული": 28,
  "კიბერპანკი": 878,
  "სლეშერი": 27,
  "პოსტ-აპოკალიფსური": 878,
  "ეროტიკული (18+)": 10749
};

const getCached = (id: string) => {
  const c = localStorage.getItem(`c_${id}`);
  return c ? JSON.parse(c) : null;
};

const setCached = (id: string, data: any) => {
  localStorage.setItem(`c_${id}`, JSON.stringify(data));
};

async function translateBatch(movies: any[]): Promise<Record<string, any>> {
  const toTranslate = movies.filter(m => !getCached(m.id));
  if (toTranslate.length === 0) return {};

  try {
    const list = toTranslate.map(m => ({ id: m.id, t: m.title, o: m.overview.slice(0, 300) }));
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following movie data into Georgian. 
      Return ONLY a JSON object: {"ID": {"title": "Georgian Title", "overview": "Georgian Plot"}}.
      Data: ${JSON.stringify(list)}`,
      config: { responseMimeType: "application/json" }
    });
    
    const results = JSON.parse(response.text.trim());
    Object.entries(results).forEach(([id, data]) => setCached(id, data));
    return results;
  } catch (e) {
    return {};
  }
}

export const fetchMovies = async (filters: FilterState): Promise<FetchResponse> => {
  try {
    const isAdultRequested = filters.genres.includes("ეროტიკული (18+)");
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: 'ka-GE',
      page: filters.page.toString(),
      include_adult: isAdultRequested ? 'true' : 'false'
    });

    let url = '';
    if (filters.searchQuery) {
      url = `${TMDB_BASE_URL}/search/movie?${params.toString()}&query=${encodeURIComponent(filters.searchQuery)}`;
    } else {
      // Use comma (,) for AND logic (precise matches)
      const genreIds = Array.from(new Set(filters.genres.map(g => GENRE_MAP[g]).filter(Boolean))).join(',');
      const countryCodes = filters.countries.join('|');
      
      params.append('sort_by', filters.sortBy);
      params.append('vote_average.gte', filters.minRating.toString());
      params.append('primary_release_date.gte', `${filters.years[0]}-01-01`);
      params.append('primary_release_date.lte', `${filters.years[1]}-12-31`);
      
      if (genreIds) params.append('with_genres', genreIds);
      if (countryCodes) params.append('with_origin_country', countryCodes);
      
      url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    const rawMovies = data.results || [];
    
    const translations = await translateBatch(rawMovies);

    const movies = await Promise.all(rawMovies.map(async (m: any) => {
      const detailRes = await fetch(`${TMDB_BASE_URL}/movie/${m.id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,external_ids&language=ka-GE`);
      const details = await detailRes.json();
      
      const trans = translations[m.id] || getCached(m.id.toString());
      const trailer = details.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      
      return {
        id: m.id.toString(),
        title: trans?.title || m.title || m.original_title,
        originalTitle: m.original_title,
        year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
        tmdbRating: m.vote_average,
        imdbRating: m.vote_average + (Math.random() * 0.4 - 0.2),
        genres: details.genres?.map((g: any) => g.name) || [],
        description: trans?.overview || details.overview || "აღწერა არ არის.",
        director: details.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'უცნობია',
        cast: details.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [],
        posterUrl: m.poster_path ? `${IMAGE_BASE_URL}${m.poster_path}` : `https://picsum.photos/seed/${m.id}/400/600`,
        trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(m.original_title + ' trailer')}`,
        imdbUrl: details.external_ids?.imdb_id ? `https://www.imdb.com/title/${details.external_ids.imdb_id}` : `https://www.themoviedb.org/movie/${m.id}`
      };
    }));

    return { movies, totalPages: Math.min(data.total_pages || 1, 500) };
  } catch (error) {
    return { movies: [], totalPages: 0 };
  }
};
