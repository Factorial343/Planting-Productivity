import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PLANTS, plantImage, type PlantId } from '../avatar/plants';
import { colors, spacing } from '../theme';

type PlantPickerProps = {
  value: PlantId;
  onChange: (plant: PlantId) => void;
};

export function PlantPicker({ value, onChange }: PlantPickerProps) {
  return (
    <View style={styles.row}>
      {PLANTS.map((p) => (
        <Pressable
          key={p.id}
          accessibilityRole="button"
          accessibilityLabel={`${p.name}${value === p.id ? ', Selected' : ''}`}
          onPress={() => onChange(p.id)}
          style={[styles.tile, value === p.id && styles.tileSelected]}
        >
          <Image source={plantImage(p.id, 5)} style={styles.image} resizeMode="contain" />
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.blurb}>{p.blurb}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  tileSelected: { borderColor: colors.primary, backgroundColor: '#DCEFE3' },
  image: { width: 84, height: 84 },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  blurb: { color: colors.mutedText, fontSize: 12, textAlign: 'center' },
});