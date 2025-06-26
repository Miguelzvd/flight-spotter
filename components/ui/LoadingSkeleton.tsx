"use client";

import clsx from "clsx";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const LoadingSkeleton = ({
  className,
  variant = "rectangular",
  width,
  height,
}: LoadingSkeletonProps) => {
  const baseClasses = "skeleton";

  const variantClasses = {
    text: "h-4",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
};

export const FlightCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <LoadingSkeleton variant="circular" width={40} height={40} />
        <div className="space-y-2">
          <LoadingSkeleton width={120} height={16} />
          <LoadingSkeleton width={80} height={14} />
        </div>
      </div>
      <div className="text-right space-y-2">
        <LoadingSkeleton width={80} height={20} />
        <LoadingSkeleton width={60} height={14} />
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <LoadingSkeleton width={60} height={16} />
        <LoadingSkeleton width={100} height={14} />
      </div>
      <div className="flex-1 px-8">
        <LoadingSkeleton height={2} className="w-full" />
      </div>
      <div className="space-y-2 text-right">
        <LoadingSkeleton width={60} height={16} />
        <LoadingSkeleton width={100} height={14} />
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <LoadingSkeleton width={100} height={14} />
      <LoadingSkeleton width={80} height={36} />
    </div>
  </div>
);

export const FlightSearchFormSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <LoadingSkeleton width={60} height={14} />
        <LoadingSkeleton height={48} />
      </div>
      <div className="space-y-2">
        <LoadingSkeleton width={80} height={14} />
        <LoadingSkeleton height={48} />
      </div>
      <div className="space-y-2">
        <LoadingSkeleton width={100} height={14} />
        <LoadingSkeleton height={48} />
      </div>
      <div className="space-y-2">
        <LoadingSkeleton width={80} height={14} />
        <LoadingSkeleton height={48} />
      </div>
    </div>
    <LoadingSkeleton width={120} height={48} />
  </div>
);

export default LoadingSkeleton;
