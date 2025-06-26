"use client";

import { useState, useEffect } from "react";
import {
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import AirportSearch from "./ui/AirportSearch";
import DatePicker from "./ui/DatePicker";
import InputField from "./ui/InputField";
import Button from "./ui/Button";
import {
  PopularAirport,
  FlightSearchRequest,
  FlightSearchResponse,
} from "@/types/flight";
import { flightApi } from "@/lib/api";

interface FlightSearchFormProps {
  onSearch: (results: FlightSearchResponse) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

const FlightSearchForm = ({
  onSearch,
  onLoading,
  onError,
}: FlightSearchFormProps) => {
  const [origin, setOrigin] = useState<PopularAirport | null>(null);
  const [destination, setDestination] = useState<PopularAirport | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [cabinClass, setCabinClass] = useState<
    "economy" | "premium_economy" | "business" | "first"
  >("economy");
  const [tripType, setTripType] = useState<"round-trip" | "one-way">(
    "round-trip"
  );
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!origin) {
      newErrors.origin = "Please select departure airport";
    }

    if (!destination) {
      newErrors.destination = "Please select destination airport";
    }

    if (origin && destination && origin.entityId === destination.entityId) {
      newErrors.destination = "Destination must be different from origin";
    }

    if (!departureDate) {
      newErrors.departureDate = "Please select departure date";
    } else if (departureDate < new Date()) {
      newErrors.departureDate = "Departure date cannot be in the past";
    }

    if (tripType === "round-trip") {
      if (!returnDate) {
        newErrors.returnDate = "Please select return date";
      } else if (departureDate && returnDate <= departureDate) {
        newErrors.returnDate = "Return date must be after departure date";
      }
    }

    if (passengers < 1 || passengers > 9) {
      newErrors.passengers = "Passengers must be between 1 and 9";
    }

    if (children < 0 || children > 8) {
      newErrors.children = "Children must be between 0 and 8";
    }

    if (passengers + children > 9) {
      newErrors.passengers = "Total passengers cannot exceed 9";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const swapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);

    const newErrors = { ...errors };
    delete newErrors.origin;
    delete newErrors.destination;
    setErrors(newErrors);
  };

  const handleSearch = async () => {
    onError(null);

    if (!validateForm()) {
      return;
    }

    if (!origin || !destination || !departureDate) {
      return;
    }

    setIsSearching(true);
    onLoading(true);

    try {
      console.log("🔍 Starting flight search...");
      console.log("Origin:", origin);
      console.log("Destination:", destination);

      const searchParams: FlightSearchRequest = {
        originSkyId: origin.code,
        destinationSkyId: destination.code,
        originEntityId: origin.entityId || origin.code,
        destinationEntityId: destination.entityId || destination.code,
        date: departureDate.toISOString().split("T")[0],
        cabinClass,
        adults: passengers.toString(),
        sortBy: "best",
        currency: "USD",
        market: "en-US",
        countryCode: "US",
      };

      if (tripType === "round-trip" && returnDate) {
        searchParams.returnDate = returnDate.toISOString().split("T")[0];
      }

      if (children > 0) {
        searchParams.childrens = children.toString();
      }

      console.log("Search params:", searchParams);

      const results = await flightApi.searchFlights(searchParams);

      if (results.status && results.flights.length > 0) {
        console.log(`✅ Found ${results.flights.length} flights`);
        onSearch(results);
      } else if (results.status && results.flights.length === 0) {
        onError(
          "No flights found for the selected route and dates. Try different dates or airports."
        );
      } else {
        onError(
          "Failed to search flights. Please check your internet connection and try again."
        );
      }
    } catch (error) {
      console.error("❌ Flight search failed:", error);

      if (error instanceof Error) {
        if (error.message.includes("Could not find")) {
          onError(
            "Airport not found. Please select a valid airport from the dropdown."
          );
        } else if (
          error.message.includes("Missing required airport information")
        ) {
          onError(
            "Please select both departure and destination airports from the dropdown."
          );
        } else if (error.message.includes("Invalid search parameters")) {
          onError(
            "Invalid search parameters. Please check your airports and travel dates."
          );
        } else if (error.message.includes("API authentication failed")) {
          onError("Service temporarily unavailable. Please try again later.");
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch") ||
          error.message.includes("timeout")
        ) {
          onError(
            "Network error. Please check your internet connection and try again."
          );
        } else if (
          error.message.includes("API limit") ||
          error.message.includes("quota") ||
          error.message.includes("exceeded")
        ) {
          onError(
            "Daily search limit reached. Please try again tomorrow or contact support."
          );
        } else if (error.message.includes("Server error")) {
          onError(
            "Service temporarily unavailable. Please try again in a few minutes."
          );
        } else if (error.message.includes("API Error:")) {
          const apiError = error.message.replace("API Error: ", "");
          onError(
            `Search failed: ${apiError}. Please try different search criteria.`
          );
        } else {
          onError(`Search failed: ${error.message}`);
        }
      } else {
        onError(
          "An unexpected error occurred while searching for flights. Please try again later."
        );
      }
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const handleReset = () => {
    setOrigin(null);
    setDestination(null);
    setDepartureDate(null);
    setReturnDate(null);
    setPassengers(1);
    setChildren(0);
    setCabinClass("economy");
    setTripType("round-trip");
    setErrors({});
    onError(null);
    onSearch({ flights: [], totalResults: 0, searchId: "", status: false });
  };

  useEffect(() => {
    if (tripType === "one-way") {
      setReturnDate(null);
      const newErrors = { ...errors };
      delete newErrors.returnDate;
      setErrors(newErrors);
    }
  }, [tripType]);

  const apiStats = flightApi.getApiStats();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-bold text-white">Search Flights</h2>

            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-primary-100 bg-primary-800/30 px-3 py-1 rounded-full">
                API: {apiStats.requestCount}/20 | Cache: {apiStats.cacheSize}{" "}
                items
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="round-trip"
                checked={tripType === "round-trip"}
                onChange={(e) => setTripType(e.target.value as "round-trip")}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Round trip
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="one-way"
                checked={tripType === "one-way"}
                onChange={(e) => {
                  setTripType(e.target.value as "one-way");
                  setReturnDate(null);
                  const newErrors = { ...errors };
                  delete newErrors.returnDate;
                  setErrors(newErrors);
                }}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                One way
              </span>
            </label>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <div className="w-full">
              <AirportSearch
                label="From"
                value={origin}
                onChange={setOrigin}
                placeholder="Departure airport"
                error={errors.origin}
                showNearby={true}
              />
            </div>

            <button
              type="button"
              onClick={swapAirports}
              className="bg-white border-2 md:mt-5 border-gray-200 rounded-full p-2 hover:border-primary-500 hover:text-primary-600 hover:shadow-md transition-all duration-200 shadow-sm"
              title="Swap airports"
            >
              <ArrowsRightLeftIcon className="h-4 w-4" />
            </button>

            <div className="w-full">
              <AirportSearch
                label="To"
                value={destination}
                onChange={setDestination}
                placeholder="Destination airport"
                error={errors.destination}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <div className="w-full  ">
              <DatePicker
                label="Departure Date"
                value={departureDate}
                onChange={setDepartureDate}
                minDate={new Date()}
                error={errors.departureDate}
                placeholder="Select departure date"
              />
            </div>
            <div className="w-full">
              {tripType === "round-trip" && (
                <DatePicker
                  label="Return Date"
                  value={returnDate}
                  onChange={setReturnDate}
                  minDate={departureDate || new Date()}
                  error={errors.returnDate}
                  placeholder="Select return date"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Adults"
              type="number"
              value={passengers.toString()}
              onChange={(e) =>
                setPassengers(
                  Math.max(1, Math.min(9, parseInt(e.target.value) || 1))
                )
              }
              min="1"
              max="9"
              error={errors.passengers}
            />

            <InputField
              label="Children"
              type="number"
              value={children.toString()}
              onChange={(e) =>
                setChildren(
                  Math.max(0, Math.min(8, parseInt(e.target.value) || 0))
                )
              }
              min="0"
              max="8"
              error={errors.children}
            />

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cabin Class
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as any)}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSearch}
              disabled={
                isSearching || !origin || !destination || !departureDate
              }
              loading={isSearching}
              className="flex-1 min-h-[48px]"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              {isSearching ? "Searching Flights..." : "Search Flights"}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleReset}
              disabled={isSearching}
              className="sm:w-auto min-h-[48px]"
            >
              Reset
            </Button>
          </div>

          {apiStats.remainingRequests <= 5 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800">
                    <strong>API Limit Warning:</strong> Only{" "}
                    {apiStats.remainingRequests} requests remaining this month.
                    Results are cached to optimize usage.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightSearchForm;
