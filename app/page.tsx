"use client";

import { useState } from "react";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightResults from "@/components/FlightResults";
import { FlightSearchResponse } from "@/types/flight";

export default function Home() {
  const [searchResults, setSearchResults] =
    useState<FlightSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (results: FlightSearchResponse) => {
    setSearchResults(results);
    setError(null);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleError = (errorMessage: string | null) => {
    setError(errorMessage);
    if (errorMessage) {
      setSearchResults(null);
    }
  };

  const handleRetry = () => {
    setError(null);
    // The form will handle the retry logic
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Flight Spotter ✈️
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the best flight deals with real-time data from Sky Scrapper
            API. Compare prices, airlines, and schedules all in one place.
          </p>
        </div>

        {/* Search Form */}
        <FlightSearchForm
          onSearch={handleSearch}
          onLoading={handleLoading}
          onError={handleError}
        />

        {/* Results */}
        <FlightResults
          results={searchResults}
          loading={isLoading}
          error={error}
          onRetry={handleRetry}
          onClearError={handleClearError}
        />
      </div>
    </main>
  );
}
