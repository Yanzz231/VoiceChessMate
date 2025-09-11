import React from "react";
import Svg, { G, Path, Polygon } from "react-native-svg";

export const KingV1 = ({ width = 192, height = 192, color = "#000000" }) => {
  return (
    <Svg viewBox="0 0 384.66 388.26" width={width} height={height}>
      <G id="Layer_2">
        <G id="Layer_1-2">
          <Path
            d="M192.67,85.17V22.48"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="14"
            fill="none"
          />
          <Polygon
            points="193.37,132.5 190.37,132.5 177.2,127.33 177.2,70.89 154.58,70.73 147.18,63.28 147.18,48.19 155.71,39.61 177.2,39.48 177.2,21.17 187.37,7 197.37,7 208.54,21.17 208.54,39.67 229.96,40.13 238.56,47.9 238.56,64.13 228.02,70.89 208.54,71.54 208.54,127.33 196.37,132.5 193.37,132.5"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="14"
            fill="none"
          />
          <Path
            d="M192.67,241.06s50.11-83.52,33.41-116.93c0,0-11.14-27.84-33.41-27.84s-33.41,27.84-33.41,27.84c-16.7,33.41,33.41,116.93,33.41,116.93"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="14"
            fill="none"
          />
          <Path
            d="M70.18,352c61.25,39,172.61,39,233.85,0v-78S404.25,224,370.84,157.15c-44.54-72.38-150.33-39-178.17,44.54v0C153.69,118.17,47.9,84.76,14.5,157.15-18.91,224,70.18,268.51,70.18,268.51Z"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="14"
            fill="none"
          />
          <Path
            d="M70.18,274.07c61.25-33.41,172.61-33.41,233.85,0"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="14"
            fill="none"
          />
          <Path
            d="M70.18,313c61.25-33.41,172.61-33.41,233.85,0"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="14"
            fill="none"
          />
          <Path
            d="M70.18,352c61.25-33.41,172.61-33.41,233.85,0"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="14"
            fill="none"
          />
        </G>
      </G>
    </Svg>
  );
};
