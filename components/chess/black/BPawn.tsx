import React from "react";
import Svg, { G, Path } from "react-native-svg";

export const BPawn = ({ width = 192, height = 192, color = "#000000" }) => {
  return (
    <Svg viewBox="0 0 237.73 292.27" width={width} height={height}>
      <G id="Layer_2">
        <G id="Layer_1-2">
          <Path
            d="M118.86,7C97.37,7,80,23.33,80,43.49a35.13,35.13,0,0,0,7.59,21.71c-19,10.22-31.91,29.29-31.91,51.27,0,18.52,9.14,35,23.44,45.89C49.9,172,7,213,7,285.27H230.73c0-72.26-42.9-113.22-72.08-122.9,14.3-10.86,23.44-27.37,23.44-45.89,0-22-12.94-41.06-31.91-51.27a35.13,35.13,0,0,0,7.59-21.71C157.77,23.33,140.36,7,118.86,7Z"
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
