"use client";

import { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import { CalendarIcon } from "@heroicons/react/24/outline";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

// Custom input component para o DatePicker
const CustomInput = forwardRef<HTMLInputElement, any>(
  ({ value, onClick, placeholder, disabled, error }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        value={value || ""}
        onClick={onClick}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
        className={`
        w-full pl-4 pr-12 py-3 text-sm
        border border-gray-300 rounded-lg
        cursor-pointer transition-all duration-200
        ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white hover:border-gray-400"
        }
        ${
          error
            ? "border-red-500 ring-1 ring-red-500"
            : "focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        }
        ${!value ? "text-gray-500" : "text-gray-900"}
      `}
      />

      {/* Calendar Icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <CalendarIcon className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  )
);

CustomInput.displayName = "CustomInput";

const DatePicker = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  disabled = false,
  placeholder = "Select date",
}: DatePickerProps) => {
  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* DatePicker */}
      <ReactDatePicker
        selected={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        placeholderText={placeholder}
        dateFormat="MMM dd, yyyy"
        customInput={
          <CustomInput
            placeholder={placeholder}
            disabled={disabled}
            error={error}
          />
        }
        popperClassName="z-50"
        calendarClassName="!border !border-gray-200 !rounded-lg !shadow-lg"
        dayClassName={(date) => {
          const isSelected =
            value && date.toDateString() === value.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();

          return `
            !w-8 !h-8 !leading-8 !text-sm !rounded-md !transition-colors !cursor-pointer
            ${
              isSelected
                ? "!bg-primary-600 !text-white hover:!bg-primary-700"
                : isToday
                ? "!bg-primary-100 !text-primary-700 hover:!bg-primary-200"
                : "hover:!bg-gray-100"
            }
          `;
        }}
        showPopperArrow={false}
        popperModifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ]}
      />

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Helper Text */}
      {!error && minDate && (
        <p className="mt-1 text-xs text-gray-500">
          Select a date from {formatDisplayDate(minDate)} onwards
        </p>
      )}
    </div>
  );
};

export default DatePicker;
