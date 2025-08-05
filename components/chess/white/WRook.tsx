import React from "react";
import Svg, { G, Path } from "react-native-svg";

export const WRook = ({
  width = 192,
  height = 192,
  color = "#000000",
  fillColor = "#e6e6e6",
}) => {
  return (
    <Svg viewBox="0 0 296.93 328.37" width={width} height={height}>
      <G id="Layer_2">
        <G id="Layer_1-2">
          <Path
            d="M7,321.37H289.93V289.93H7Z"
            fill={fillColor}
            stroke={color}
            strokeLinejoin="round"
            strokeWidth="14"
          />
          <Path
            d="M38.44,289.93V248H258.5v41.92Z"
            fill={fillColor}
            stroke={color}
            strokeLinejoin="round"
            strokeWidth="14"
          />
          <Path
            d="M28,59.39V7H69.87V28h52.39V7h52.39V28h52.39V7H269V59.39"
            fill={fillColor}
            stroke={color}
            strokeLinejoin="round"
            strokeWidth="14"
          />
          <Path
            d="M237.54,221.82,253.26,248H43.68l15.72-26.2"
            fill={fillColor}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="14"
          />
          <Path
            d="M237.54,90.83V217.51H59.39V90.83"
            fill={fillColor}
            stroke={color}
            strokeWidth="14"
          />
          <Path
            d="M269,59.39,237.54,90.83H59.39L28,59.39"
            fill={fillColor}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="14"
          />
          <Path
            d="M28,59.39H269"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="14"
            fill="none"
          />
        </G>
      </G>
    </Svg>
  );
};
