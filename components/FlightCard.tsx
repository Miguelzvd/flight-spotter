"use client";

import { Flight } from "@/types/flight";
import Button from "./ui/Button";
import { ArrowRightIcon, ClockIcon } from "@heroicons/react/24/outline";

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
}

const FlightCard = ({ flight, onSelect }: FlightCardProps) => {
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">{flight.airline.logo}</div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {flight.airline.name}
            </h3>
            <p className="text-sm text-gray-500">{flight.airline.code}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {flight.price.formatted ||
              `$${flight.price.total.toLocaleString()}`}
          </div>
          <p className="text-sm text-gray-500 capitalize">{flight.fareType}</p>
          {flight.score && (
            <p className="text-xs text-green-600 font-medium">
              Score: {flight.score.toFixed(1)}
            </p>
          )}
        </div>
      </div>

      {/* Flight Route */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(firstSegment.departure.time)}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(firstSegment.departure.date)}
          </div>
          <div className="text-lg font-semibold text-gray-900 mt-1">
            {firstSegment.departure.airport.code}
          </div>
          <div className="text-xs text-gray-500">
            {firstSegment.departure.airport.city}
          </div>
        </div>

        <div className="flex-1 px-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <ClockIcon className="h-4 w-4 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {flight.duration}
              </span>
              {flight.stops > 0 && (
                <span className="text-xs text-orange-600 font-medium mt-1">
                  {flight.stops} stop{flight.stops > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <ArrowRightIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(lastSegment.arrival.time)}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(lastSegment.arrival.date)}
          </div>
          <div className="text-lg font-semibold text-gray-900 mt-1">
            {lastSegment.arrival.airport.code}
          </div>
          <div className="text-xs text-gray-500">
            {lastSegment.arrival.airport.city}
          </div>
        </div>
      </div>

      {/* Stop Details */}
      {flight.stops > 0 && flight.stopDetails && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
          <div className="text-sm text-orange-800">
            {flight.stopDetails.join(", ")}
          </div>
        </div>
      )}

      {/* Flight Details */}
      {flight.segments.length > 1 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Flight Details:</h4>
          {flight.segments.map((segment, index) => (
            <div
              key={index}
              className="text-sm text-gray-600 flex items-center space-x-2"
            >
              <span>{segment.flightNumber}</span>
              <span>•</span>
              <span>{segment.aircraft}</span>
              <span>•</span>
              <span>{segment.duration}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {flight.segments.length === 1
            ? "Non-stop"
            : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
        </div>
        <Button variant="primary" size="sm" onClick={() => onSelect?.(flight)}>
          Select Flight
        </Button>
      </div>
    </div>
  );
};

export default FlightCard;
