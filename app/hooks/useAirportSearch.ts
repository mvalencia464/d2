import { useState, useEffect } from 'react';

export interface Airport {
  iata: string;
  name: string;
  city: string;
  state?: string;
  country: string;
}

// Curated list of smaller regional airports in the Pacific Northwest and Western US
const REGIONAL_AIRPORTS: Airport[] = [
  { iata: 'KBDN', name: 'Bend Municipal Airport', city: 'Bend', state: 'OR', country: 'USA' },
  { iata: 'KRDM', name: 'Roberts Field', city: 'Redmond', state: 'OR', country: 'USA' },
  { iata: 'KEUG', name: 'Mahlon Sweet Field', city: 'Eugene', state: 'OR', country: 'USA' },
  { iata: 'KPDX', name: 'Portland International', city: 'Portland', state: 'OR', country: 'USA' },
  { iata: 'KSEA', name: 'Seattle-Tacoma International', city: 'Seattle', state: 'WA', country: 'USA' },
  { iata: 'KBFI', name: 'Boeing Field', city: 'Seattle', state: 'WA', country: 'USA' },
  { iata: 'KPAE', name: 'Paine Field', city: 'Everett', state: 'WA', country: 'USA' },
  { iata: 'KGEG', name: 'Spokane International', city: 'Spokane', state: 'WA', country: 'USA' },
  { iata: 'KBOI', name: 'Boise Airport', city: 'Boise', state: 'ID', country: 'USA' },
  { iata: 'KSUN', name: 'Friedman Memorial', city: 'Sun Valley', state: 'ID', country: 'USA' },
  { iata: 'KTWF', name: 'Magic Valley Regional', city: 'Twin Falls', state: 'ID', country: 'USA' },
  { iata: 'KSLC', name: 'Salt Lake City International', city: 'Salt Lake City', state: 'UT', country: 'USA' },
  { iata: 'KLAS', name: 'Harry Reid International', city: 'Las Vegas', state: 'NV', country: 'USA' },
  { iata: 'KRNO', name: 'Reno-Tahoe International', city: 'Reno', state: 'NV', country: 'USA' },
  { iata: 'KSMF', name: 'Sacramento International', city: 'Sacramento', state: 'CA', country: 'USA' },
  { iata: 'KSFO', name: 'San Francisco International', city: 'San Francisco', state: 'CA', country: 'USA' },
  { iata: 'KSJC', name: 'Norman Y. Mineta San Jose', city: 'San Jose', state: 'CA', country: 'USA' },
  { iata: 'KLAX', name: 'Los Angeles International', city: 'Los Angeles', state: 'CA', country: 'USA' },
  { iata: 'KSAN', name: 'San Diego International', city: 'San Diego', state: 'CA', country: 'USA' },
  { iata: 'KPHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', state: 'AZ', country: 'USA' },
  { iata: 'KDEN', name: 'Denver International', city: 'Denver', state: 'CO', country: 'USA' },
  { iata: 'KASE', name: 'Aspen-Pitkin County', city: 'Aspen', state: 'CO', country: 'USA' },
  { iata: 'KEGE', name: 'Eagle County Regional', city: 'Vail', state: 'CO', country: 'USA' },
  { iata: 'KMSO', name: 'Missoula International', city: 'Missoula', state: 'MT', country: 'USA' },
  { iata: 'KBZN', name: 'Bozeman Yellowstone', city: 'Bozeman', state: 'MT', country: 'USA' },
  { iata: 'KJAC', name: 'Jackson Hole Airport', city: 'Jackson', state: 'WY', country: 'USA' },
  { iata: 'KOAK', name: 'Oakland International', city: 'Oakland', state: 'CA', country: 'USA' },
  { iata: 'KBUR', name: 'Hollywood Burbank', city: 'Burbank', state: 'CA', country: 'USA' },
  { iata: 'KSNA', name: 'John Wayne Airport', city: 'Santa Ana', state: 'CA', country: 'USA' },
  { iata: 'KPSP', name: 'Palm Springs International', city: 'Palm Springs', state: 'CA', country: 'USA' },
];

export const useAirportSearch = () => {
  const [airports] = useState<Airport[]>(REGIONAL_AIRPORTS);
  const [searchResults, setSearchResults] = useState<Airport[]>([]);

  const searchAirports = (query: string): Airport[] => {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const results = airports.filter(airport => 
      airport.iata.toLowerCase().includes(searchTerm) ||
      airport.name.toLowerCase().includes(searchTerm) ||
      airport.city.toLowerCase().includes(searchTerm) ||
      (airport.state && airport.state.toLowerCase().includes(searchTerm))
    );

    return results.slice(0, 10); // Limit to 10 results
  };

  return {
    airports,
    searchAirports,
    searchResults,
    setSearchResults
  };
};

