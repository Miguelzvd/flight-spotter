export interface SkyScrapperAirport {
  id: string;
  entityId: string;
  skyId?: string;
  name: string;
  type: string;
  iata?: string;
  icao?: string;
  localizedName?: string;
  city?: string;
  country?: string;
  location?: {
    lat: number;
    lon: number;
  };
  hierarchy?: {
    continent?: {
      id: string;
      name: string;
    };
    country?: {
      id: string;
      name: string;
    };
    city?: {
      id: string;
      name: string;
    };
  };
  presentation?: {
    suggestionTitle: string;
  };
}

export interface SkyScrapperFlightLeg {
  origin: {
    id: string;
    entityId: string;
    name: string;
    displayCode: string;
    city: string;
    country: string;
  };
  destination: {
    id: string;
    entityId: string;
    name: string;
    displayCode: string;
    city: string;
    country: string;
  };
  durationInMinutes: number;
  stopCount: number;
  departure: string;
  arrival: string;
  carriers: {
    marketing: Array<{
      id: number;
      name: string;
      alternateId: string;
      allianceId: number;
      displayCode: string;
    }>;
  };
  segments: Array<{
    id: string;
    origin: {
      flightPlaceId: string;
      displayCode: string;
      parent: {
        flightPlaceId: string;
        displayCode: string;
        name: string;
        type: string;
      };
      name: string;
      type: string;
    };
    destination: {
      flightPlaceId: string;
      displayCode: string;
      parent: {
        flightPlaceId: string;
        displayCode: string;
        name: string;
        type: string;
      };
      name: string;
      type: string;
    };
    departure: string;
    arrival: string;
    durationInMinutes: number;
    flightNumber: string;
    marketingCarrier: {
      id: number;
      name: string;
      alternateId: string;
      allianceId: number;
      displayCode: string;
    };
    operatingCarrier: {
      id: number;
      name: string;
      alternateId: string;
      allianceId: number;
      displayCode: string;
    };
  }>;
}

export interface SkyScrapperItinerary {
  id: string;
  price: {
    raw: number;
    formatted: string;
    pricingOptionId: string;
  };
  legs: SkyScrapperFlightLeg[];
  isSelfTransfer: boolean;
  isProtectedSelfTransfer: boolean;
  farePolicy: {
    isChangeAllowed: boolean;
    isPartiallyChangeable: boolean;
    isCancellationAllowed: boolean;
    isPartiallyRefundable: boolean;
  };
  eco: {
    ecoContenderDelta: number;
  };
  fareAttributes: any;
  tags: string[];
  isMashUp: boolean;
  hasFlexibleOptions: boolean;
  score: number;
}

export interface SkyScrapperSearchResponse {
  status: boolean;
  timestamp: number;
  sessionId: string;
  message?: string; // Para mensagens de erro da API
  data?: {
    context: {
      status: string;
      sessionId: string;
      totalResults: number;
    };
    itineraries: SkyScrapperItinerary[];
    messages: any[];
    filterStats: any;
    flightsSessionId: string;
    destinationImageUrl: string;
  };
}

export interface SkyScrapperAirportSearchResponse {
  status: boolean;
  timestamp: number;
  data: SkyScrapperAirport[];
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  entityId?: string;
}

export interface FlightSegment {
  departure: {
    airport: Airport;
    time: string;
    date: string;
  };
  arrival: {
    airport: Airport;
    time: string;
    date: string;
  };
  duration: string;
  flightNumber: string;
  aircraft: string;
}

export interface Flight {
  id: string;
  airline: {
    name: string;
    code: string;
    logo: string;
  };
  segments: FlightSegment[];
  price: {
    total: number;
    currency: string;
    formatted: string;
  };
  duration: string;
  stops: number;
  stopDetails?: string[];
  fareType: "economy" | "premium_economy" | "business" | "first";
  bookingUrl: string;
  score?: number;
}

export interface FlightSearchRequest {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  date: string;
  returnDate?: string | undefined;
  cabinClass: string;
  adults: string;
  childrens?: string | undefined;
  sortBy: string;
  currency: string;
  market: string;
  countryCode: string;
}

export interface FlightSearchResponse {
  flights: Flight[];
  totalResults: number;
  searchId: string;
  status: boolean;
}

export interface PopularAirport {
  code: string;
  name: string;
  city: string;
  country: string;
  entityId?: string;
  popular: boolean;
}
