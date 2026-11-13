import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
});
