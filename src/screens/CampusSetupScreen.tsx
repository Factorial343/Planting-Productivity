import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors, radius, spacing } from '../theme';

type CampusSetupScreenProps = {
  onSave: () => void;
  onCancel: () => void;
};

const MIN_RADIUS = 100;
const MAX_RADIUS = 1000;
const RADIUS_STEP = 100;

export function CampusSetupScreen({
  onSave,
  onCancel,
}: CampusSetupScreenProps) {
  const [name, setName] = useState('Main campus');
  const [radiusMeters, setRadiusMeters] = useState(300);
  const previewSize = 64 + ((radiusMeters - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 112;

  const adjustRadius = (amount: number) => {
    setRadiusMeters((current) =>
      Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, current + amount)),
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Set campus zone</Text>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Name</Text>
          <TextInput
            accessibilityLabel="Campus zone name"
            value={name}
            onChangeText={setName}
            placeholder="Campus name"
            placeholderTextColor={colors.mutedText}
            style={styles.nameInput}
          />
        </Card>

        <Button
          title="Use my current location"
          variant="outline"
          onPress={() => {}}
          style={styles.locationButton}
        />

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Radius: {radiusMeters} m</Text>
          <View style={styles.stepper}>
            <Button
              title="-"
              variant="outline"
              disabled={radiusMeters <= MIN_RADIUS}
              onPress={() => adjustRadius(-RADIUS_STEP)}
              style={styles.stepButton}
            />
            <Button
              title="+"
              variant="outline"
              disabled={radiusMeters >= MAX_RADIUS}
              onPress={() => adjustRadius(RADIUS_STEP)}
              style={styles.stepButton}
            />
          </View>
        </Card>

        <View style={styles.mapPreview}>
          <View
            accessibilityLabel={`Circle preview for ${radiusMeters} meter radius`}
            style={[
              styles.previewCircle,
              { width: previewSize, height: previewSize },
            ]}
          />
        </View>
        <Text style={styles.previewCaption}>
          Circle preview only (no map library).
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save zone"
          onPress={onSave}
          style={styles.footerButton}
        />
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  pageTitle: {
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  nameInput: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    backgroundColor: colors.card,
    fontSize: 17,
  },
  locationButton: {
    minHeight: 54,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stepButton: {
    flex: 1,
    minHeight: 48,
  },
  mapPreview: {
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: '#E8EEEA',
  },
  previewCircle: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.round,
  },
  previewCaption: {
    color: colors.mutedText,
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  footerButton: {
    minHeight: 56,
  },
});
