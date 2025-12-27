/**
 * Utility to parse GPS coordinates from various formats
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Parse GPS coordinates from the legacy 'mapa' field
 * Supports multiple formats:
 * - "lat,lng" (e.g., "-29.123456,-51.654321")
 * - "lat, lng" (with space)
 * - Google Maps URL
 * - Various other coordinate formats
 */
export class CoordinateParser {
  /**
   * Parse coordinates from string
   */
  static parse(input: string | null | undefined): Coordinates | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }

    try {
      // Try different parsing strategies
      return (
        this.parseSimpleLatLng(trimmed) ||
        this.parseGoogleMapsUrl(trimmed) ||
        this.parsePointFormat(trimmed) ||
        null
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse simple "lat,lng" format
   * Examples: "-29.123456,-51.654321" or "-29.123456, -51.654321"
   */
  private static parseSimpleLatLng(input: string): Coordinates | null {
    // Match pattern: number, optional space, number
    const match = input.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    
    if (!match) {
      return null;
    }

    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);

    if (this.isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }

    return null;
  }

  /**
   * Parse Google Maps URL
   * Examples:
   * - https://maps.google.com/?q=-29.123,-51.456
   * - https://www.google.com/maps/@-29.123,-51.456,15z
   * - https://goo.gl/maps/...
   */
  private static parseGoogleMapsUrl(input: string): Coordinates | null {
    // Pattern 1: ?q=lat,lng
    let match = input.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (this.isValidCoordinate(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Pattern 2: @lat,lng
    match = input.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (this.isValidCoordinate(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Pattern 3: /ll=lat,lng
    match = input.match(/[/&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (this.isValidCoordinate(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    return null;
  }

  /**
   * Parse "POINT(lng lat)" or similar formats
   */
  private static parsePointFormat(input: string): Coordinates | null {
    // Match POINT(lng lat) format
    const match = input.match(/POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i);
    
    if (!match) {
      return null;
    }

    // Note: POINT format is (longitude latitude)
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);

    if (this.isValidCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }

    return null;
  }

  /**
   * Validate coordinate ranges
   * Latitude: -90 to 90
   * Longitude: -180 to 180
   */
  private static isValidCoordinate(lat: number, lng: number): boolean {
    return (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      // Exclude obviously wrong values like 0,0 (off coast of Africa)
      !(lat === 0 && lng === 0)
    );
  }

  /**
   * Extract GPS from 'ponto' field if available
   * Format might be different, adjust as needed
   */
  static parseFromPonto(ponto: string | null | undefined): Coordinates | null {
    if (!ponto) {
      return null;
    }

    return this.parse(ponto);
  }
}
