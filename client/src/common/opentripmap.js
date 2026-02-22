// OpenTripMap API utility for hospital search
import axios from 'axios';

const OPENTRIPMAP_API_KEY = '5ae2e3f221c38a28845f05b621d821dbc5e99f718b7311572cceb893';
const BASE_URL = 'https://api.opentripmap.com/0.1/en/places';

export async function fetchHospitals(lat, lon, radius = 5000) {
  // Search for hospitals near lat/lon
  const kinds = 'healthcare.hospital';
  const url = `${BASE_URL}/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=${kinds}&apikey=${OPENTRIPMAP_API_KEY}`;
  const resp = await axios.get(url);
  return resp.data.features || [];
}

export async function fetchHospitalDetails(xid) {
  // Fetch details for a hospital by xid
  const url = `${BASE_URL}/xid/${xid}?apikey=${OPENTRIPMAP_API_KEY}`;
  const resp = await axios.get(url);
  return resp.data;
}

// Example: fetchHospitals(48.8566, 2.3522) for Paris
