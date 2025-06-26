"use client";

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { flightApi } from "@/lib/api";
import { PopularAirport } from "@/types/flight";

interface AirportSearchProps {
  label: string;
  value: PopularAirport | null;
  onChange: (airport: PopularAirport | null) => void;
  placeholder: string;
  error?: string;
  showNearby?: boolean;
  disabled?: boolean;
}

const AirportSearch = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  showNearby = false,
  disabled = false,
}: AirportSearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [airports, setAirports] = useState<PopularAirport[]>([]);
  const [nearbyAirports, setNearbyAirports] = useState<PopularAirport[]>([]);
  const [showNearbySection, setShowNearbySection] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Buscar aeroportos próximos quando o componente montar
  useEffect(() => {
    if (showNearby) {
      loadNearbyAirports();
    }
  }, [showNearby]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (!value) {
          setQuery("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  // Sincronizar query com valor selecionado
  useEffect(() => {
    if (value) {
      setQuery(value.name);
    }
  }, [value]);

  const loadNearbyAirports = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const nearby = await flightApi.getNearbyAirports(
              latitude,
              longitude
            );
            setNearbyAirports(nearby.slice(0, 5)); // Limitar a 5 aeroportos próximos
            setShowNearbySection(nearby.length > 0);
          },
          async () => {
            // Fallback sem geolocalização
            const nearby = await flightApi.getNearbyAirports();
            setNearbyAirports(nearby.slice(0, 5));
            setShowNearbySection(nearby.length > 0);
          }
        );
      } else {
        // Fallback para navegadores sem geolocalização
        const nearby = await flightApi.getNearbyAirports();
        setNearbyAirports(nearby.slice(0, 5));
        setShowNearbySection(nearby.length > 0);
      }
    } catch (error) {
      console.error("Error loading nearby airports:", error);
    }
  };

  const searchAirports = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setAirports([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await flightApi.searchAirports(searchQuery);
      setAirports(results);
    } catch (error) {
      console.error("Error searching airports:", error);
      setAirports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);

    // Se o usuário limpar o input, limpar a seleção
    if (!newQuery.trim()) {
      onChange(null);
      setAirports([]);
      return;
    }

    // Debounce da busca
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAirports(newQuery);
    }, 500);
  };

  const handleAirportSelect = (airport: PopularAirport) => {
    onChange(airport);
    setQuery(airport.name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setAirports([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!query.trim() && showNearbySection && nearbyAirports.length > 0) {
      // Mostrar aeroportos próximos quando o input está vazio
    }
  };

  // Formatação do nome do aeroporto seguindo o padrão da API
  const formatAirportName = (airport: PopularAirport) => {
    if (airport.city && airport.country && airport.code) {
      return `${airport.city} (${airport.code})`;
    }
    return airport.name || airport.code;
  };

  const shouldShowResults =
    isOpen &&
    (airports.length > 0 ||
      isLoading ||
      (showNearbySection && nearbyAirports.length > 0 && !query.trim()));

  return (
    <div className="relative w-full" ref={searchRef}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Input Container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3 text-sm
            border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            ${error ? "border-red-500 ring-red-500" : ""}
          `}
        />

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown Results */}
      {shouldShowResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Nearby Airports Section */}
          {showNearbySection && nearbyAirports.length > 0 && !query.trim() && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center text-xs font-medium text-gray-500 mb-2">
                <MapPinIcon className="h-4 w-4 mr-1" />
                Nearby Airports
              </div>
              {nearbyAirports.map((airport) => (
                <button
                  key={airport.entityId || airport.code}
                  onClick={() => handleAirportSelect(airport)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-primary-600">
                    {formatAirportName(airport)}
                  </div>
                  <div className="text-xs text-gray-500">{airport.country}</div>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              Searching airports...
            </div>
          ) : airports.length > 0 ? (
            <div className="p-2">
              {query.trim() && (
                <div className="px-3 py-1 text-xs font-medium text-gray-500 mb-1">
                  Search Results
                </div>
              )}
              {airports.map((airport) => (
                <button
                  key={airport.entityId || airport.code}
                  onClick={() => handleAirportSelect(airport)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-primary-600">
                    {formatAirportName(airport)}
                  </div>
                  <div className="text-xs text-gray-500">{airport.country}</div>
                </button>
              ))}
            </div>
          ) : query.trim() && !isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">No airports found</div>
              <div className="text-xs text-gray-400 mt-1">
                Try searching with city name or airport code
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AirportSearch;
