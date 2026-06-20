import Svg, { Circle } from 'react-native-svg';

type PulseIconProps = {
  size?: number;
};

export function PulseIcon({ size = 32 }: PulseIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Circle cx={195} cy={256} r={135} fill="none" stroke="#14b8a6" strokeWidth={35} />
      <Circle cx={350} cy={256} r={135} fill="none" stroke="#dadcde" strokeWidth={35} />
    </Svg>
  );
}