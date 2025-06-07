export interface Route {
    id: string;
    name: string;
    description: string;
    duration: string;
}

export interface PoiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Route[];
}