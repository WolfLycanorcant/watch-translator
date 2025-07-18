import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface WatchButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const WatchButton = memo<WatchButtonProps>(({
  label,
  onPress,
  style,
  textStyle,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button, 
        style,
        disabled && styles.disabled
      ]}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
      hitSlop={{
        top: 16,
        bottom: 16,
        left: 16,
        right: 16,
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <Text style={[
        styles.label, 
        textStyle,
        disabled && styles.disabledText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

WatchButton.displayName = 'WatchButton';

const styles = StyleSheet.create({
  button: {
    minWidth: 64,
    minHeight: 64,
    padding: 16,
    borderRadius: 32,
    backgroundColor: '#9E7FFF',
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
  disabled: {
    backgroundColor: '#666',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledText: {
    color: '#ccc',
  },
});
