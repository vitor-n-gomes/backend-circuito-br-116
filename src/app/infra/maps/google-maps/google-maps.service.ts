import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IMapsService,
  GeocodeResult,
  PlaceDetails,
  DistanceMatrixResult,
  DirectionsResult,
} from '../interfaces/maps.interface.service';
import axios from 'axios';


@Injectable()
export class GoogleMapsService implements IMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';
  private axiosInstance: any;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    this.axiosInstance = axios.create({
      timeout: 10000,
    });
  }

  async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      const url = `${this.baseUrl}/geocode/json`;
      const response = await this.axiosInstance.get(url, {
        params: {
          address,
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
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
      const url = `${this.baseUrl}/geocode/json`;
      const response = await this.axiosInstance.get(url, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
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
      const url = `${this.baseUrl}/place/textsearch/json`;
      const params: any = {
        query,
        key: this.apiKey,
      };

      if (latitude && longitude) {
        params.location = `${latitude},${longitude}`;
        params.radius = radius;
      }

      const response = await this.axiosInstance.get(url, { params });

      if (response.data.status === 'OK' && response.data.results) {
        return response.data.results.map((place: any) => ({
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
      const url = `${this.baseUrl}/place/details/json`;
      const response = await this.axiosInstance.get(url, {
        params: {
          place_id: placeId,
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.result) {
        const place = response.data.result;
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
      const url = `${this.baseUrl}/distancematrix/json`;
      const response = await this.axiosInstance.get(url, {
        params: {
          origins: origins.join('|'),
          destinations: destinations.join('|'),
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.rows) {
        const results: DistanceMatrixResult[] = [];
        for (const row of response.data.rows) {
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
      const url = `${this.baseUrl}/directions/json`;
      const response = await this.axiosInstance.get(url, {
        params: {
          origin,
          destination,
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
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
