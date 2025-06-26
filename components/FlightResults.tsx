"use client";

import { useState } from "react";
import FlightCard from "./FlightCard";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import Button from "./ui/Button";
import { Flight, FlightSearchResponse } from "@/types/flight";
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface FlightResultsProps {
  results: FlightSearchResponse | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onClearError?: () => void;
}

const FlightResults = ({
  results,
  loading,
  error,
  onRetry,
  onClearError,
}: FlightResultsProps) => {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3 text-primary-600">
            <ClockIcon className="h-6 w-6 animate-pulse" />
            <span className="text-lg font-medium">Searching flights...</span>
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Search Error
        </h3>

        <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {onClearError && (
            <Button variant="secondary" onClick={onClearError}>
              <XCircleIcon className="h-4 w-4 mr-2" />
              Clear Error
            </Button>
          )}
        </div>

        {/* Tips for common errors */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
          <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Tips:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Try popular routes like JFK → LAX or LHR → JFK</li>
            <li>• Select dates within the next 30 days</li>
            <li>• Check your internet connection</li>
            <li>• Make sure to select airports from the dropdown</li>
          </ul>
        </div>
      </div>
    );
  }

  // No results yet
  if (!results) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
          <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ready to find flights?
        </h3>

        <p className="text-gray-600 mb-6">
          Enter your travel details above and search for the best flight deals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <span>Real-time prices</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <span>Multiple airlines</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <span>Best deals</span>
          </div>
        </div>
      </div>
    );
  }

  // No flights found
  if (results.flights.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No flights found
        </h3>

        <p className="text-gray-600 mb-6">
          We couldn't find any flights for your search criteria. Try adjusting
          your dates or destinations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">
              Try different dates
            </h4>
            <p className="text-blue-700">
              Flexible dates often have more options
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-1">
              Check nearby airports
            </h4>
            <p className="text-green-700">
              Alternative airports may have flights
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state with results
  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Flight Results
            </h2>
            <p className="text-gray-600">
              Found {results.flights.length} flight
              {results.flights.length !== 1 ? "s" : ""}
              {results.totalResults > results.flights.length &&
                ` (showing ${results.flights.length} of ${results.totalResults})`}
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">
              Search ID: {results.searchId}
            </div>
            <div className="text-xs text-gray-400">
              Prices updated in real-time
            </div>
          </div>
        </div>
      </div>

      {/* Flight cards */}
      <div className="space-y-4">
        {results.flights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            onSelect={setSelectedFlight}
          />
        ))}
      </div>

      {/* Load more button if there are more results */}
      {results.totalResults > results.flights.length && (
        <div className="text-center py-6">
          <Button variant="secondary" disabled>
            Showing {results.flights.length} of {results.totalResults} flights
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            API optimization: Limited results to conserve requests
          </p>
        </div>
      )}
    </div>
  );
};

export default FlightResults;
