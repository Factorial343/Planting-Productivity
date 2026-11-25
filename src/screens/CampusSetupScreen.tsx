import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { campusesRepo, saveCampusZone } from '../db';
import { useLocation } from '../location/useLocation';
import type { Coordinates } from '../types';
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
  const [name, setName] = useState('Main Campus');
  const [radiusMeters, setRadiusMeters] = useState(300);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const previewSize = 64 + ((radiusMeters - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 112;

  // After the button is tapped we also listen for live updates. Some emulators
  // fail the one-time reading but still send location updates.
  const [tracking, setTracking] = useState(false);
  const location = useLocation({
    enabled: tracking,
    onFix: (fix) => setCoords(fix.coords),
  });

  // Start from the saved campus zone, if there is one.
  useEffect(() => {
    let cancelled = false;
    campusesRepo
      .list()
      .then((list) => {
        const saved = list[0];
        if (!saved || cancelled) return;
        setName(saved.name);
        setRadiusMeters(
          Math.max(
            MIN_RADIUS,
            Math.min(MAX_RADIUS, Math.round(saved.radiusM / RADIUS_STEP) * RADIUS_STEP),
          ),
        );
        if (saved.latitude !== 0 || saved.longitude !== 0) {
          setCoords({ latitude: saved.latitude, longitude: saved.longitude });
        }
      })
      .catch((e) => console.error('Failed to load campus', e));
    return () => {
      cancelled = true;
    };
  }, []);

  const adjustRadius = (amount: number) => {
    setRadiusMeters((current) =>
      Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, current + amount)),
    );
  };

  const fillFromLocation = async () => {
    setMessage('Getting Your Location...');
    setTracking(true);
    const permission = await location.requestPermission();
    setMessage(
      permission === 'denied'
        ? 'Location Permission Was Denied. Allow It In Settings To Use This Button.'
        : '',
    );
  };

  const save = async () => {
    if (!coords) return;
    setSaving(true);
    try {
      await saveCampusZone({
        name: name.trim() || 'Main Campus',
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusM: radiusMeters,
      });
      onSave();
    } catch (e) {
      console.error('Failed to save campus zone', e);
      setMessage('Could Not Save. Check The Metro Terminal.');
      setSaving(false);
    }
  };

  const accuracy = location.currentFix?.accuracyM;
  const notice = message || location.error || '';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Set Campus Zone</Text>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Name</Text>
          <TextInput
            accessibilityLabel="Campus zone name"
            value={name}
            onChangeText={setName}
            placeholder="Campus Name"
            placeholderTextColor={colors.mutedText}
            style={styles.nameInput}
          />
        </Card>

        <Button
          title="Use My Current Location"
          variant="outline"
          onPress={fillFromLocation}
          style={styles.locationButton}
        />
        <Text style={styles.previewCaption}>
          {coords
            ? `Location: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}${
                accuracy ? ` (Within ${Math.round(accuracy)} m)` : ''
              }`
            : 'No Location Set Yet. Tap The Button Above.'}
        </Text>
        {notice ? <Text style={styles.previewCaption}>{notice}</Text> : null}

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
          Circle Preview Only (No Map Library).
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Zone"
          disabled={!coords || saving}
          onPress={save}
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
    backgroundColor: '#EEF7F1',
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
