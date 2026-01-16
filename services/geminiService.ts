// @ts-ignore
import { GoogleGenAI } from "@google/genai";
import { FilterState, Movie, FetchResponse } from "../types";

// (import.meta as any) გამოიყენება, რომ TypeScript-მა env-ზე არ იჩხუბოს
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");
const ai = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const ai = new GoogleGenAI({ apiKey: apiKey });

const TMDB_API_KEY = 'd877fc4def9cce3c864d7abe176cb0ac';
const TMDB_BASE_URL = 'https://api.themoviedb.org';
const IMAGE_BASE_URL = 'https://image.tmdb.org';

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
      model: "gemini-1.5-flash",
      contents: `Translate the following movie data into Georgian. 
      Return ONLY a JSON object: {"ID": {"title": "Georgian Title", "overview": "Georgian Plot"}}.
      Data: ${JSON.stringify(list)}`,
      config: { responseMimeType: "application/json" }
    });
    
    // აი აქ დავამატეთ შემოწმება, რომ response.text() არ იყოს undefined
    const responseText = response && (response as any).text ? (response as any).text : ""; 
    if (!responseText) return {};

    const results = JSON.parse(responseText.trim());
    Object.entries(results).forEach(([id, data]) => setCached(id, data));
    return results;
  } catch (e) {
    console.error("Translation error:", e);
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
      const genreIds = Array.from(new Set(filters.genres.map(g => GENRE_MAP[g]).filter(Boolean))).join(',');
      const countryCodes = filters.countries.join('|');
      
      params.append('sort_by', filters.sortBy);
      params.append('vote_average.gte', filters.minRating.toString());
      
      // წლების ფილტრის მასივის დამუშავება
      const yearStart = Array.isArray(filters.years) ? filters.years[0] : 1900;
      const yearEnd = Array.isArray(filters.years) ? filters.years[1] : 2026;

      params.append('primary_release_date.gte', `${yearStart}-01-01`);
      params.append('primary_release_date.lte', `${yearEnd}-12-31`);
      
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
        posterUrl: m.poster_path ? `${IMAGE_BASE_URL}${m.poster_path}` : `https://picsum.photos{m.id}/400/600`,
        trailerUrl: trailer ? `https://www.youtube.com{trailer.key}` : `https://www.youtube.com{encodeURIComponent(m.original_title + ' trailer')}`,
        imdbUrl: details.external_ids?.imdb_id ? `https://www.imdb.com{details.external_ids.imdb_id}` : `https://www.themoviedb.org{m.id}`
      };
    }));

    return { movies, totalPages: Math.min(data.total_pages || 1, 500) };
  } catch (error) {
    console.error("Fetch error:", error);
    return { movies: [], totalPages: 0 };
  }
};
