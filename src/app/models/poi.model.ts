export interface Municipality {
  id: string;
  name: string;
  description: string;
  state: {
    id: string;
    name: string;
    description: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  duration: string;
}

export interface Poi {
  id: string;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  image: string;
  video: string;
  municipality: Municipality;
  category: Category;
  route: Route;
}

export interface PoiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Poi[];
}