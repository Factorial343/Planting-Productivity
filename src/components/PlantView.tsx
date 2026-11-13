import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

type PlantViewProps = {
  stage: 1 | 2 | 3 | 4 | 5;
};

export function PlantView({ stage }: PlantViewProps) {
  const leaves = Array.from({ length: stage }, (_, index) => index);
  const stemHeight = 24 + stage * 15;

  return (
    <View
      accessibilityLabel={`Plant, stage ${stage} of 5`}
      accessible
      style={styles.plant}
    >
      <View style={[styles.stem, { height: stemHeight }]} />
      {leaves.map((leaf, index) => (
        <View
          key={leaf}
          style={[
            styles.leaf,
            index % 2 === 0 ? styles.leftLeaf : styles.rightLeaf,
            { top: 52 - Math.floor((index + 1) / 2) * 18 },
          ]}
        />
      ))}
      <View style={styles.pot}>
        {stage === 1 ? <View style={styles.seed} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plant: {
    width: 112,
    height: 136,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  stem: {
    position: 'absolute',
    bottom: 32,
    width: 5,
    backgroundColor: colors.primary,
  },
  leaf: {
    position: 'absolute',
    width: 38,
    height: 20,
    borderRadius: radius.round,
    backgroundColor: '#6EAE85',
  },
  leftLeaf: {
    left: 10,
    transform: [{ rotate: '-8deg' }],
  },
  rightLeaf: {
    right: 10,
    transform: [{ rotate: '8deg' }],
  },
  pot: {
    width: 64,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#D9D5CA',
  },
  seed: {
    width: 12,
    height: 8,
    borderRadius: radius.round,
    backgroundColor: '#8D7451',
  },
});
