import axios from "axios";
import {
  FlightSearchRequest,
  FlightSearchResponse,
  Flight,
  PopularAirport,
  SkyScrapperSearchResponse,
  SkyScrapperAirportSearchResponse,
  SkyScrapperItinerary,
  Airport,
} from "@/types/flight";

const BASE_URL = "https://sky-scrapper.p.rapidapi.com";

// Suas credenciais fornecidas
const API_KEY = "592e587330msh39082dd580a4324p1ae4afjsn5d30bdfd7b7f";

// Headers padrão para todas as requisições
const DEFAULT_HEADERS = {
  "X-RapidAPI-Key": API_KEY,
  "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
  "Content-Type": "application/json",
};

// Cache para otimizar uso das 20 requisições mensais
class ApiCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set(key: string, data: any, ttlMinutes: number = 60) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

class FlightApiService {
  private axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: DEFAULT_HEADERS,
    timeout: 30000,
  });

  private cache = new ApiCache();
  private requestCount = 0; // Contador para monitorar uso da API

  private logApiCall(endpoint: string) {
    this.requestCount++;
    console.log(`🔄 API Call #${this.requestCount}: ${endpoint}`);
    if (this.requestCount >= 18) {
      console.warn(
        "⚠️ Approaching API limit! Only 2 requests remaining this month."
      );
    }
  }

  // Função auxiliar para converter duração em minutos para formato legível
  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  // Função auxiliar para converter data/hora ISO para formato legível
  private formatDateTime(isoString: string): { date: string; time: string } {
    const date = new Date(isoString);
    return {
      date: date.toISOString().split("T")[0],
      time: date.toTimeString().substring(0, 5),
    };
  }

  // Função auxiliar para converter aeroporto do Sky Scrapper para nosso formato
  private convertAirport(skyAirport: any): Airport {
    return {
      code: skyAirport.displayCode || skyAirport.iata || skyAirport.skyId || "",
      name: skyAirport.name || "",
      city: skyAirport.city || skyAirport.hierarchy?.city?.name || "",
      country: skyAirport.country || skyAirport.hierarchy?.country?.name || "",
      entityId: skyAirport.entityId || skyAirport.skyId || skyAirport.id,
    };
  }

  // Função auxiliar para converter itinerário do Sky Scrapper para nosso formato
  private convertItineraryToFlight(itinerary: SkyScrapperItinerary): Flight {
    const leg = itinerary.legs[0];
    const segments = leg.segments.map((segment) => {
      const departure = this.formatDateTime(segment.departure);
      const arrival = this.formatDateTime(segment.arrival);

      return {
        departure: {
          airport: this.convertAirport(segment.origin),
          time: departure.time,
          date: departure.date,
        },
        arrival: {
          airport: this.convertAirport(segment.destination),
          time: arrival.time,
          date: arrival.date,
        },
        duration: this.formatDuration(segment.durationInMinutes),
        flightNumber: `${segment.marketingCarrier.displayCode}${segment.flightNumber}`,
        aircraft: segment.marketingCarrier.name,
      };
    });

    const airline = leg.carriers.marketing[0];

    return {
      id: itinerary.id,
      airline: {
        name: airline?.name || "Unknown Airline",
        code: airline?.displayCode || "",
        logo: this.getAirlineLogo(airline?.displayCode || ""),
      },
      segments,
      price: {
        total: itinerary.price.raw,
        currency: "USD",
        formatted: itinerary.price.formatted,
      },
      duration: this.formatDuration(leg.durationInMinutes),
      stops: leg.stopCount,
      stopDetails:
        leg.stopCount > 0
          ? [`${leg.stopCount} stop${leg.stopCount > 1 ? "s" : ""}`]
          : [],
      fareType: "economy",
      bookingUrl: "#",
      score: itinerary.score,
    };
  }

  private getAirlineLogo(code: string): string {
    const logos: Record<string, string> = {
      AA: "🇺🇸",
      UA: "🇺🇸", // United Airlines
      DL: "🇺🇸", // Delta Airlines
      EK: "🇦🇪", // Emirates
      QR: "🇶🇦", // Qatar Airways
      TK: "🇹🇷", // Turkish Airlines
      LH: "🇩🇪", // Lufthansa
      AF: "🇫🇷", // Air France
      BA: "🇬🇧", // British Airways
      KL: "🇳🇱", // KLM
      SQ: "🇸🇬", // Singapore Airlines
      CX: "🇭🇰", // Cathay Pacific
      JL: "🇯🇵", // JAL
      NH: "🇯🇵", // ANA
    };
    return logos[code] || "✈️";
  }

  // Buscar aeroportos por texto (autocomplete)
  async searchAirports(query: string): Promise<PopularAirport[]> {
    try {
      const cacheKey = `airports:${query.toLowerCase()}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log("📋 Cache hit for airport search:", query);
        return cached;
      }

      this.logApiCall("/api/v1/flights/searchAirport");

      const response =
        await this.axiosInstance.get<SkyScrapperAirportSearchResponse>(
          "/api/v1/flights/searchAirport",
          {
            params: {
              query,
              locale: "en-US",
            },
          }
        );

      if (!response.data.status || !response.data.data) {
        console.error("❌ Airport search failed:", response.data);
        return [];
      }

      const airports = response.data.data
        .filter((airport) => airport.iata || airport.skyId) // Filtrar apenas aeroportos válidos
        .slice(0, 8) // Limitar resultados
        .map((airport) => ({
          code: airport.iata || airport.skyId || "",
          name:
            airport.presentation?.suggestionTitle ||
            airport.name ||
            `${airport.city} (${airport.iata || airport.skyId})`,
          city: airport.hierarchy?.city?.name || airport.city || "",
          country: airport.hierarchy?.country?.name || airport.country || "",
          entityId: airport.entityId || airport.skyId || "",
          popular: false,
        }));

      // Cache por 4 horas para economizar requisições
      this.cache.set(cacheKey, airports, 240);

      console.log(`✅ Found ${airports.length} airports for "${query}"`);
      return airports;
    } catch (error) {
      console.error("❌ Airport search error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response:", error.response?.data);
      }
      return [];
    }
  }

  // Obter aeroportos próximos baseado na localização
  async getNearbyAirports(
    lat?: number,
    lng?: number
  ): Promise<PopularAirport[]> {
    try {
      const cacheKey = `nearby:${lat || "default"},${lng || "default"}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log("📋 Cache hit for nearby airports");
        return cached;
      }

      this.logApiCall("/api/v1/flights/getNearByAirports");

      const params: any = {
        locale: "en-US",
      };

      if (lat && lng) {
        params.lat = lat.toString();
        params.lng = lng.toString();
      }

      const response = await this.axiosInstance.get(
        "/api/v1/flights/getNearByAirports",
        {
          params,
        }
      );

      if (!response.data.status || !response.data.data) {
        return [];
      }

      const airports = response.data.data.slice(0, 10).map((airport: any) => ({
        code: airport.iata || airport.skyId || "",
        name:
          airport.presentation?.suggestionTitle ||
          airport.name ||
          `${airport.city} (${airport.iata || airport.skyId})`,
        city: airport.hierarchy?.city?.name || airport.city || "",
        country: airport.hierarchy?.country?.name || airport.country || "",
        entityId: airport.entityId || airport.skyId || "",
        popular: true,
      }));

      // Cache por 24 horas
      this.cache.set(cacheKey, airports, 1440);

      console.log(`✅ Found ${airports.length} nearby airports`);
      return airports;
    } catch (error) {
      console.error("❌ Nearby airports error:", error);
      return [];
    }
  }

  // Buscar voos com otimização de requisições
  async searchFlights(
    searchParams: FlightSearchRequest
  ): Promise<FlightSearchResponse> {
    try {
      // Cache key baseado nos parâmetros de busca
      const cacheKey = `flights:${searchParams.originSkyId}-${
        searchParams.destinationSkyId
      }-${searchParams.date}-${searchParams.returnDate || "oneway"}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log("📋 Cache hit for flight search");
        return cached;
      }

      // Usar os parâmetros já formatados do FlightSearchForm
      let originSkyId = searchParams.originSkyId;
      let destinationSkyId = searchParams.destinationSkyId;
      let originEntityId = searchParams.originEntityId;
      let destinationEntityId = searchParams.destinationEntityId;

      // Validar se os parâmetros necessários foram fornecidos
      if (
        !originSkyId ||
        !destinationSkyId ||
        !originEntityId ||
        !destinationEntityId
      ) {
        throw new Error("Missing required airport information");
      }

      // Se os entity IDs não contêm ".", tentar buscar pelos códigos
      if (!originEntityId.includes(".")) {
        const originAirports = await this.searchAirports(originSkyId);
        const originAirport = originAirports.find(
          (a) => a.code === originSkyId
        );
        if (originAirport?.entityId) {
          originEntityId = originAirport.entityId;
        }
      }

      if (!destinationEntityId.includes(".")) {
        const destinationAirports = await this.searchAirports(destinationSkyId);
        const destinationAirport = destinationAirports.find(
          (a) => a.code === destinationSkyId
        );
        if (destinationAirport?.entityId) {
          destinationEntityId = destinationAirport.entityId;
        }
      }

      this.logApiCall("/api/v2/flights/searchFlightsComplete");

      const params: any = {
        originSkyId: originSkyId,
        destinationSkyId: destinationSkyId,
        originEntityId: originEntityId,
        destinationEntityId: destinationEntityId,
        date: searchParams.date,
        cabinClass: searchParams.cabinClass || "economy",
        adults: searchParams.adults || "1",
        sortBy: searchParams.sortBy || "best",
        currency: searchParams.currency || "USD",
        market: searchParams.market || "en-US",
        countryCode: searchParams.countryCode || "US",
      };

      // Adicionar crianças se fornecido
      if (searchParams.childrens) {
        params.childrens = searchParams.childrens;
      }

      // Adicionar data de retorno se fornecida
      if (searchParams.returnDate) {
        params.returnDate = searchParams.returnDate;
      }

      console.log("🔍 Searching flights with params:", params);
      console.log("🔍 API Stats before request:", this.getApiStats());

      const response = await this.axiosInstance.get<SkyScrapperSearchResponse>(
        "/api/v2/flights/searchFlightsComplete",
        {
          params,
        }
      );

      console.log("📡 API Response status:", response.status);
      console.log("📡 API Response data:", response.data);

      // Melhor tratamento da resposta da API
      if (!response.data) {
        console.error("❌ No response data received from API");
        throw new Error("No response data received from API");
      }

      if (response.data.status === false) {
        console.error("❌ API returned error:", response.data);

        // Verificar se é um erro de limite de API
        if (response.data.message && response.data.message.includes("quota")) {
          throw new Error("API quota exceeded. Please try again later.");
        }

        // Verificar se é um erro de parâmetros inválidos
        if (
          response.data.message &&
          response.data.message.includes("invalid")
        ) {
          throw new Error(
            "Invalid search parameters. Please check your airports and dates."
          );
        }

        // Erro genérico da API
        throw new Error(
          `API Error: ${response.data.message || "Unknown API error"}`
        );
      }

      const itineraries = response.data.data?.itineraries || [];

      if (itineraries.length === 0) {
        console.log("ℹ️ No flights found for the search criteria");
        return {
          flights: [],
          totalResults: 0,
          searchId: response.data.sessionId || "",
          status: true,
        };
      }

      const flights = itineraries
        .slice(0, 15) // Limitar a 15 resultados
        .map((itinerary) => this.convertItineraryToFlight(itinerary))
        .sort((a, b) => a.price.total - b.price.total);

      const result = {
        flights,
        totalResults:
          response.data.data?.context?.totalResults || flights.length,
        searchId: response.data.sessionId || "",
        status: true,
      };

      // Cache por 30 minutos para economizar requisições
      this.cache.set(cacheKey, result, 30);

      console.log(`✅ Found ${flights.length} flights`);
      return result;
    } catch (error) {
      console.error("❌ Flight search error:", error);

      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        console.error("Request URL:", error.config?.url);
        console.error("Request params:", error.config?.params);

        if (error.response?.status === 429) {
          throw new Error("API limit exceeded. Please try again later.");
        } else if (error.response?.status === 400) {
          throw new Error(
            "Invalid search parameters. Please check your airports and dates."
          );
        } else if (error.response?.status === 401) {
          throw new Error(
            "API authentication failed. Please check your API key."
          );
        } else if (error.response && error.response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else if (error.response?.data?.message) {
          throw new Error(`API Error: ${error.response.data.message}`);
        }
      }

      throw error;
    }
  }

  // Verificar status do servidor
  async checkServerStatus(): Promise<boolean> {
    try {
      const cached = this.cache.get("server-status");
      if (cached !== null) {
        return cached;
      }

      this.logApiCall("/api/v1/checkServer");

      const response = await this.axiosInstance.get("/api/v1/checkServer");
      const status = response.data.status === true;

      // Cache por 5 minutos
      this.cache.set("server-status", status, 5);

      return status;
    } catch (error) {
      console.error("❌ Server check failed:", error);
      return false;
    }
  }

  // Obter aeroportos populares (fallback sem usar API)
  getPopularAirports(): PopularAirport[] {
    return [
      {
        code: "JFK",
        name: "John F. Kennedy International",
        city: "New York",
        country: "USA",
        entityId: "95673679",
        popular: true,
      },
      {
        code: "LAX",
        name: "Los Angeles International",
        city: "Los Angeles",
        country: "USA",
        entityId: "95673620",
        popular: true,
      },
      {
        code: "LHR",
        name: "London Heathrow",
        city: "London",
        country: "UK",
        entityId: "95565050",
        popular: true,
      },
      {
        code: "CDG",
        name: "Charles de Gaulle",
        city: "Paris",
        country: "France",
        entityId: "95565040",
        popular: true,
      },
      {
        code: "DXB",
        name: "Dubai International",
        city: "Dubai",
        country: "UAE",
        entityId: "95673663",
        popular: true,
      },
      {
        code: "GRU",
        name: "São Paulo Guarulhos",
        city: "São Paulo",
        country: "Brazil",
        entityId: "95673692",
        popular: true,
      },
    ];
  }

  // Método para limpar cache (útil para desenvolvimento)
  clearCache() {
    this.cache.clear();
    console.log("🗑️ Cache cleared");
  }

  // Método para obter estatísticas de uso da API
  getApiStats() {
    return {
      requestCount: this.requestCount,
      remainingRequests: Math.max(0, 20 - this.requestCount),
      cacheSize: this.cache["cache"].size,
    };
  }
}

export const flightApi = new FlightApiService();
