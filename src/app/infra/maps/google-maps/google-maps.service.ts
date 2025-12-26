import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IMapsService,
  GeocodeResult,
  PlaceDetails,
  DistanceMatrixResult,
  DirectionsResult,
} from '../interfaces/maps.interface.service';

@Injectable()
export class GoogleMapsService implements IMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
  }

  async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: address,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodeResult | null> {
    try {
      const url = `${this.baseUrl}/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: result.formatted_address,
          latitude: latitude,
          longitude: longitude,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
        };
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  async searchPlaces(
    query: string,
    latitude?: number,
    longitude?: number,
    radius: number = 5000
  ): Promise<PlaceDetails[]> {
    try {
      let url = `${this.baseUrl}/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}`;

      if (latitude && longitude) {
        url += `&location=${latitude},${longitude}&radius=${radius}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        return data.results.map((place: any) => ({
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          rating: place.rating,
          types: place.types,
        }));
      }

      return [];
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const place = data.result;
        return {
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          phoneNumber: place.formatted_phone_number,
          website: place.website,
          rating: place.rating,
          types: place.types,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting place details:', error);
      throw error;
    }
  }

  async getDistanceMatrix(
    origins: string[],
    destinations: string[]
  ): Promise<DistanceMatrixResult[]> {
    try {
      const originsParam = origins.map((o) => encodeURIComponent(o)).join('|');
      const destinationsParam = destinations
        .map((d) => encodeURIComponent(d))
        .join('|');

      const url = `${this.baseUrl}/distancematrix/json?origins=${originsParam}&destinations=${destinationsParam}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows) {
        const results: DistanceMatrixResult[] = [];
        for (const row of data.rows) {
          for (const element of row.elements) {
            if (element.status === 'OK') {
              results.push({
                distance: element.distance,
                duration: element.duration,
                status: element.status,
              });
            }
          }
        }
        return results;
      }

      return [];
    } catch (error) {
      console.error('Error getting distance matrix:', error);
      throw error;
    }
  }

  async getDirections(
    origin: string,
    destination: string
  ): Promise<DirectionsResult | null> {
    try {
      const url = `${this.baseUrl}/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        return {
          distance: leg.distance.value,
          duration: leg.duration.value,
          steps: leg.steps.map((step: any) => ({
            instruction: step.html_instructions,
            distance: step.distance.value,
            duration: step.duration.value,
          })),
          polyline: route.overview_polyline?.points,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }
}
