import React, { memo, useCallback, useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IS_SMALL_SCREEN } from '@/lib/constants';

interface WatchButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  enableHaptics?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const WatchButton = memo<WatchButtonProps>(({
  label,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  enableHaptics = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const handlePress = useCallback(() => {
    if (disabled || loading) return;

    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  }, [disabled, loading, enableHaptics, onPress]);

  const buttonStyle = useMemo(() => [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    style,
    (disabled || loading) && styles.disabled
  ], [variant, size, style, disabled, loading]);

  const labelStyle = useMemo(() => [
    styles.label,
    styles[`${size}Label`],
    textStyle,
    (disabled || loading) && styles.disabledText
  ], [size, textStyle, disabled, loading]);

  const hitSlop = useMemo(() => ({
    top: IS_SMALL_SCREEN ? 12 : 16,
    bottom: IS_SMALL_SCREEN ? 12 : 16,
    left: IS_SMALL_SCREEN ? 12 : 16,
    right: IS_SMALL_SCREEN ? 12 : 16,
  }), []);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={buttonStyle}
      activeOpacity={disabled || loading ? 1 : 0.7}
      disabled={disabled || loading}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      <Text style={labelStyle}>
        {loading ? '...' : label}
      </Text>
    </TouchableOpacity>
  );
});

WatchButton.displayName = 'WatchButton';

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Variants
  primaryButton: {
    backgroundColor: '#9E7FFF',
  },
  secondaryButton: {
    backgroundColor: '#38bdf8',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },

  // Sizes
  smallButton: {
    minWidth: IS_SMALL_SCREEN ? 48 : 56,
    minHeight: IS_SMALL_SCREEN ? 48 : 56,
    padding: IS_SMALL_SCREEN ? 8 : 12,
    borderRadius: IS_SMALL_SCREEN ? 24 : 28,
  },
  mediumButton: {
    minWidth: IS_SMALL_SCREEN ? 64 : 80,
    minHeight: IS_SMALL_SCREEN ? 64 : 80,
    padding: IS_SMALL_SCREEN ? 12 : 16,
    borderRadius: IS_SMALL_SCREEN ? 32 : 40,
  },
  largeButton: {
    minWidth: IS_SMALL_SCREEN ? 80 : 96,
    minHeight: IS_SMALL_SCREEN ? 80 : 96,
    padding: IS_SMALL_SCREEN ? 16 : 20,
    borderRadius: IS_SMALL_SCREEN ? 40 : 48,
  },

  disabled: {
    backgroundColor: '#666',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },

  label: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Label sizes
  smallLabel: {
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
  },
  mediumLabel: {
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
  },
  largeLabel: {
    fontSize: IS_SMALL_SCREEN ? 16 : 18,
  },

  disabledText: {
    color: '#ccc',
  },
});
