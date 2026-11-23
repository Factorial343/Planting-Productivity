import { Image, StyleSheet, View } from 'react-native';

const IMAGES = [
  require('../../assets/timer/timer0.png'),
  require('../../assets/timer/timer10.png'),
  require('../../assets/timer/timer20.png'),
  require('../../assets/timer/timer30.png'),
  require('../../assets/timer/timer40.png'),
  require('../../assets/timer/timer50.png'),
  require('../../assets/timer/timer60.png'),
  require('../../assets/timer/timer70.png'),
  require('../../assets/timer/timer80.png'),
  require('../../assets/timer/timer90.png'),
  require('../../assets/timer/timer100.png'),
];

type TimerClockProps = {
  progress: number; // 0 at the start, 1 when the time is up
  size?: number;
};

export function TimerClock({ progress, size = 220 }: TimerClockProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const step = Math.floor(clamped * 10); // 0 to 10, one step per 10%

  return (
    <View
      accessible
      accessibilityLabel={`Timer, ${step * 10} percent done`}
      style={{ width: size, height: size }}
    >
      <Image
        source={IMAGES[step]}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}