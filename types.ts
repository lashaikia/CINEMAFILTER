
export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  tmdbRating: number;
  imdbRating?: number;
  genres: string[];
  description: string;
  director: string;
  cast: string[];
  posterUrl: string;
  trailerUrl?: string;
  imdbUrl?: string;
}

export interface FilterState {
  searchQuery: string;
  genres: string[];
  countries: string[];
  years: [number, number];
  minRating: number;
  mood: string;
  page: number;
  sortBy: string;
  viewMode: 'grid' | 'list';
}

export interface FetchResponse {
  movies: Movie[];
  totalPages: number;
}

export const GENRES = [
  "მძაფრსიუჟეტიანი", "სათავგადასავლო", "ანიმაციური", "ბიოგრაფიული", "კომედია", "კრიმინალური",
  "დოკუმენტური", "დრამა", "საოჯახო", "ფენტეზი", "ისტორიული",
  "საშინელებათა", "მუსიკალური", "დეტექტივი", "მელოდრამა", "ფანტასტიკა",
  "თრილერი", "საომარი", "ვესტერნი", "ეროტიკული (18+)",
  "ანიმე", "ფსიქოლოგიური", "სუპერგმირული", "კიბერპანკი", "სლეშერი", "პოსტ-აპოკალიფსური", 
  "მისტიკა"
];

export const COUNTRIES: Record<string, string> = {
  "US": "აშშ",
  "FR": "საფრანგეთი",
  "IT": "იტალია",
  "GB": "დიდი ბრიტანეთი",
  "GE": "საქართველო",
  "DE": "გერმანია",
  "ES": "ესპანეთი",
  "JP": "იაპონია",
  "KR": "სამხრეთ კორეა",
  "TR": "თურქეთი",
  "IN": "ინდოეთი",
  "BR": "ბრაზილია",
  "RU": "რუსეთი",
  "CN": "ჩინეთი"
};
