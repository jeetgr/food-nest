import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

type LogoProps = {
  size?: number;
  className?: string;
};

export const Logo: React.FC<LogoProps> = ({ size = 64, className }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      {/* Background */}
      <Rect x="0" y="0" width="32" height="32" rx="8" fill="#f97316" />

      {/* Utensils Crossed Icon - scaled and centered */}
      <Path
        d="M17.33 7.67l-1.15 1.15a1.5 1.5 0 0 0 0 2.1l.9.9a1.5 1.5 0 0 0 2.1 0L20.33 10.67"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(6, 6) scale(0.833)"
      />
      <Path
        d="M16.5 16.5L7.65 7.65a2.1 2.1 0 0 0 0 3l3.65 3.65c.35.35 1 .35 1.4 0L16.5 16.5m0 0l3.5 3.5"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(6, 6) scale(0.833)"
      />
      <Path
        d="M7.05 18.9l3.2-3.15"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(6, 6) scale(0.833)"
      />
      <Path
        d="M18 9l-3.5 3.5"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(6, 6) scale(0.833)"
      />
    </Svg>
  );
};
