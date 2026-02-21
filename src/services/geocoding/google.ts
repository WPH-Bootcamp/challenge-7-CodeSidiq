import axios from 'axios';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error(
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing. Add it to .env.local'
  );
}

type GoogleGeocodeResult = {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

type GoogleGeocodeResponse = {
  results: GoogleGeocodeResult[];
  status: string;
};

export const geocodeAddress = async (address: string) => {
  const endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';

  const res = await axios.get<GoogleGeocodeResponse>(endpoint, {
    params: {
      address,
      key: GOOGLE_API_KEY,
    },
  });

  if (res.data.status !== 'OK' || !res.data.results.length) {
    throw new Error('Address not found. Please refine your input.');
  }

  const first = res.data.results[0];

  return {
    latitude: first.geometry.location.lat,
    longitude: first.geometry.location.lng,
    formattedAddress: first.formatted_address,
  };
};
