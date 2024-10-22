import React from "react";

interface LoaderProps {
  size?: number;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 26,
  className = "",
}) => {
  return (
    <div
      className={`border-2 border-t-transparent border-white rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
    ></div>
  );
};
