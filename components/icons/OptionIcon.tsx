import Svg, { Path } from "react-native-svg";

export const OptionIcon = ({
  width = 192,
  height = 192,
  color = "#5C54D9",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 35 31" fill="none">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M31.1 6.64286V0.738098H27.7V6.64286H24.3V9.59524H27.7V30.2619H31.1V9.59524H34.5V6.64286H31.1ZM19.2 0.738098H15.8V14.0238H12.4V16.9762H15.8V30.2619H19.2V16.9762H22.6V14.0238H19.2V0.738098ZM7.3 21.4048H10.7V24.3571H7.3V30.2619H3.9V24.3571H0.5V21.4048H3.9V0.738098H7.3V21.4048Z"
        fill={color}
      />
    </Svg>
  );
};
