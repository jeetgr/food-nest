import React from "react";

type LogoProps = {
  className?: string;
};

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo"
    >
      {/* Background */}
      <rect x="0" y="0" width="32" height="32" rx="8" fill="#f97316" />

      {/* Utensils Crossed Icon */}
      <svg
        x="6"
        y="6"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
        <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
        <path d="m2.1 21.8 6.4-6.3" />
        <path d="m19 5-7 7" />
      </svg>
    </svg>
  );
};
