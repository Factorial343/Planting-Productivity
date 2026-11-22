import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { DEFAULT_PLANT, PLANTS, plantImage, type PlantId } from '../avatar/plants';
import { getSelectedPlant } from '../db';

type PlantViewProps = {
  stage: 1 | 2 | 3 | 4 | 5;
  // Optional. When left out, the plant the user picked is loaded from the database.
  plant?: PlantId;
  size?: number;
};

export function PlantView({ stage, plant, size = 150 }: PlantViewProps) {
  const [selected, setSelected] = useState<PlantId>(DEFAULT_PLANT);

  useEffect(() => {
    if (plant) return;
    let cancelled = false;
    getSelectedPlant()
      .then((id) => {
        if (!cancelled) setSelected(id);
      })
      .catch((e) => console.error('getSelectedPlant failed', e));
    return () => {
      cancelled = true;
    };
  }, [plant]);

  const shown = plant ?? selected;
  const name = PLANTS.find((p) => p.id === shown)?.name ?? 'Plant';

  return (
    <View
      accessibilityLabel={`${name}, stage ${stage} of 5`}
      accessible
      style={[styles.plant, { width: size, height: size }]}
    >
      <Image
        source={plantImage(shown, stage)}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  plant: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
