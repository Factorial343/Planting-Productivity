import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'darkOutline';
  style?: ViewStyle;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDarkOutline = variant === 'darkOutline';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary
          ? styles.primary
          : isDarkOutline
            ? styles.darkOutline
            : styles.outline,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          (isPrimary || isDarkOutline) && styles.primaryLabel,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  primary: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  outline: {
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  darkOutline: {
    borderColor: colors.darkBorder,
    backgroundColor: colors.darkCard,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.78,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  primaryLabel: {
    color: colors.card,
  },
});
