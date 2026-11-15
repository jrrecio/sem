
/* =========================================
   PART 1: IMPORT AXIOS API
========================================= */

import api from "../lib/api";


/* =========================================
   PART 2: VENUE INTERFACE
   Defines the venue data from Laravel
========================================= */

export interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  description: string | null;
  facilities: string[] | null;
  status: "active" | "inactive" | "maintenance";
}


/* =========================================
   PART 3: CREATE VENUE DATA INTERFACE
   Defines the fields needed to add a venue
========================================= */

export interface CreateVenueData {
  name: string;
  location: string;
  capacity: number;
  description?: string;
  facilities?: string[];
  status: "active" | "inactive" | "maintenance";
}


/* =========================================
   PART 4: GET ALL VENUES
   GET /api/venues
========================================= */

export const getVenues = async (): Promise<Venue[]> => {
  const response = await api.get<Venue[]>("/venues");

  return response.data;
};


/* =========================================
   PART 5: CREATE NEW VENUE
   POST /api/venues
========================================= */

export const createVenue = async (
  data: CreateVenueData
): Promise<Venue> => {

  const response = await api.post<{
    message: string;
    venue: Venue;
  }>("/venues", data);

  return response.data.venue;
};
