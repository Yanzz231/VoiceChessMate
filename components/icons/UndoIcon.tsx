import Svg, { Path } from "react-native-svg";

export const UndoIcon = ({ width = 192, height = 192, color = "#5C54D9" }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 43 41" fill="none">
      <Path
        d="M6.88 12.3935H23.435C27.5909 12.3935 30.96 16.1024 30.96 20.6775C30.96 25.2526 27.5909 28.9616 23.435 28.9616H12.9M6.88 12.3935L11.395 7.4231M6.88 12.3935L11.395 17.3639"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
