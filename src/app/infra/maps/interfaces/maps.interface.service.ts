export interface GeocodeResult {
  address: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  placeId?: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  types?: string[];
}

export interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  status: string;
}

export interface DirectionsResult {
  distance: number; // in meters
  duration: number; // in seconds
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
  polyline?: string;
}

export abstract class IMapsService {
  abstract geocode(address: string): Promise<GeocodeResult | null>;
  abstract reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodeResult | null>;
  abstract searchPlaces(
    query: string,
    latitude?: number,
    longitude?: number,
    radius?: number
  ): Promise<PlaceDetails[]>;
  abstract getPlaceDetails(placeId: string): Promise<PlaceDetails | null>;
  abstract getDistanceMatrix(
    origins: string[],
    destinations: string[]
  ): Promise<DistanceMatrixResult[]>;
  abstract getDirections(
    origin: string,
    destination: string
  ): Promise<DirectionsResult | null>;
}
