import { useState, useCallback, useRef } from 'react';

export interface AirportDBResult {
  iata: string;
  icao: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  elevation?: number;
  lat?: number;
  lon?: number;
}

interface UseAirportDBReturn {
  searchAirports: (query: string) => Promise<AirportDBResult[]>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to search airports using AirportDB API
 * API Documentation: https://airportdb.io/api-docs
 *
 * The API allows fetching airports by ICAO code:
 * https://airportdb.io/api/v1/airport/{ICAO}?apiToken={apiToken}
 *
 * For search functionality, we use a curated list of Pacific Northwest and Western US airports
 * which is perfect for Direct2's service area. If you need to search all airports globally,
 * you would need to implement a different search strategy (e.g., local database or different API).
 */
export const useAirportDB = (): UseAirportDBReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchAirports = useCallback(async (query: string): Promise<AirportDBResult[]> => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Validate query
    if (!query || query.trim().length < 2) {
      return [];
    }

    const apiToken = process.env.NEXT_PUBLIC_AIRPORTDB_API_TOKEN;

    if (!apiToken) {
      console.warn('AirportDB API token not found, using fallback list');
      return getFallbackAirports(query);
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const searchTerm = query.trim().toUpperCase();

      // Check if the query looks like an ICAO code (4 letters starting with K for US)
      // If so, try to fetch it directly from the API
      if (searchTerm.length === 4 && /^[A-Z]{4}$/.test(searchTerm)) {
        const url = `https://airportdb.io/api/v1/airport/${searchTerm}?apiToken=${apiToken}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: abortControllerRef.current.signal,
        });

        if (response.ok) {
          const airport = await response.json();

          // Transform the response to our interface
          const result: AirportDBResult = {
            iata: airport.iata_code || '',
            icao: airport.icao_code || airport.ident || '',
            name: airport.name || '',
            city: airport.municipality || '',
            state: airport.region_name || airport.iso_region || '',
            country: airport.iso_country || '',
            elevation: airport.elevation_ft,
            lat: airport.latitude_deg,
            lon: airport.longitude_deg,
          };

          setLoading(false);
          return [result];
        }
      }

      // For non-ICAO searches or if API fails, use the curated fallback list
      // This provides instant results for city names, partial codes, etc.
      const results = getFallbackAirports(query);
      setLoading(false);
      return results;

    } catch (err: any) {
      // Don't set error for aborted requests
      if (err.name === 'AbortError') {
        return [];
      }

      console.warn('AirportDB API error, using fallback:', err.message);
      setLoading(false);

      // Return fallback airports for common searches
      return getFallbackAirports(query);
    }
  }, []);

  return {
    searchAirports,
    loading,
    error,
  };
};

/**
 * Fallback airports when API fails
 * Focuses on Pacific Northwest and Western US regional airports
 */
function getFallbackAirports(query: string): AirportDBResult[] {
  const fallbackList: AirportDBResult[] = [
    { iata: 'BDN', icao: 'KBDN', name: 'Bend Municipal Airport', city: 'Bend', state: 'OR', country: 'USA' },
    { iata: 'RDM', icao: 'KRDM', name: 'Roberts Field', city: 'Redmond', state: 'OR', country: 'USA' },
    { iata: 'EUG', icao: 'KEUG', name: 'Mahlon Sweet Field', city: 'Eugene', state: 'OR', country: 'USA' },
    { iata: 'PDX', icao: 'KPDX', name: 'Portland International', city: 'Portland', state: 'OR', country: 'USA' },
    { iata: 'SEA', icao: 'KSEA', name: 'Seattle-Tacoma International', city: 'Seattle', state: 'WA', country: 'USA' },
    { iata: 'BFI', icao: 'KBFI', name: 'Boeing Field', city: 'Seattle', state: 'WA', country: 'USA' },
    { iata: 'PAE', icao: 'KPAE', name: 'Paine Field', city: 'Everett', state: 'WA', country: 'USA' },
    { iata: 'GEG', icao: 'KGEG', name: 'Spokane International', city: 'Spokane', state: 'WA', country: 'USA' },
    { iata: 'BOI', icao: 'KBOI', name: 'Boise Airport', city: 'Boise', state: 'ID', country: 'USA' },
    { iata: 'SUN', icao: 'KSUN', name: 'Friedman Memorial', city: 'Sun Valley', state: 'ID', country: 'USA' },
    { iata: 'SLC', icao: 'KSLC', name: 'Salt Lake City International', city: 'Salt Lake City', state: 'UT', country: 'USA' },
    { iata: 'LAS', icao: 'KLAS', name: 'Harry Reid International', city: 'Las Vegas', state: 'NV', country: 'USA' },
    { iata: 'RNO', icao: 'KRNO', name: 'Reno-Tahoe International', city: 'Reno', state: 'NV', country: 'USA' },
    { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International', city: 'San Francisco', state: 'CA', country: 'USA' },
    { iata: 'SJC', icao: 'KSJC', name: 'Norman Y. Mineta San Jose', city: 'San Jose', state: 'CA', country: 'USA' },
    { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles International', city: 'Los Angeles', state: 'CA', country: 'USA' },
    { iata: 'SAN', icao: 'KSAN', name: 'San Diego International', city: 'San Diego', state: 'CA', country: 'USA' },
    { iata: 'PHX', icao: 'KPHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', state: 'AZ', country: 'USA' },
    { iata: 'DEN', icao: 'KDEN', name: 'Denver International', city: 'Denver', state: 'CO', country: 'USA' },
  ];

  const searchTerm = query.toLowerCase();
  return fallbackList.filter(airport =>
    airport.iata.toLowerCase().includes(searchTerm) ||
    airport.icao.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm) ||
    (airport.state && airport.state.toLowerCase().includes(searchTerm))
  ).slice(0, 10);
}

