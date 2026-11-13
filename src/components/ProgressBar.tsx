import { StyleSheet, View, type ColorValue } from 'react-native';
import { colors, radius } from '../theme';

type ProgressBarProps = {
  value: number;
  trackColor?: ColorValue;
  fillColor?: ColorValue;
};

export function ProgressBar({
  value,
  trackColor = '#E0E5E1',
  fillColor = colors.primary,
}: ProgressBarProps) {
  const progress = Math.max(0, Math.min(1, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 1, now: progress }}
      style={[styles.track, { backgroundColor: trackColor }]}
    >
      <View
        style={[
          styles.fill,
          { width: `${progress * 100}%`, backgroundColor: fillColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    overflow: 'hidden',
    borderRadius: radius.round,
  },
  fill: {
    height: '100%',
    borderRadius: radius.round,
  },
});
