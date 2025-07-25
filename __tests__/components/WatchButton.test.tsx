import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WatchButton } from '@/components/WatchButton';

describe('WatchButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly with label', () => {
    const { getByText } = render(
      <WatchButton label="Test Button" onPress={mockOnPress} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByRole } = render(
      <WatchButton label="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByRole } = render(
      <WatchButton label="Test Button" onPress={mockOnPress} disabled />
    );
    
    fireEvent.press(getByRole('button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading state correctly', () => {
    const { getByText } = render(
      <WatchButton label="Test Button" onPress={mockOnPress} loading />
    );
    
    expect(getByText('...')).toBeTruthy();
  });

  it('applies correct variant styles', () => {
    const { getByRole } = render(
      <WatchButton label="Test Button" onPress={mockOnPress} variant="danger" />
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('applies correct size styles', () => {
    const { getByRole } = render(
      <WatchButton label="Test Button" onPress={mockOnPress} size="large" />
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('has correct accessibility properties', () => {
    const { getByRole } = render(
      <WatchButton 
        label="Test Button" 
        onPress={mockOnPress}
        accessibilityLabel="Custom Label"
        accessibilityHint="Custom Hint"
      />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Custom Label');
    expect(button.props.accessibilityHint).toBe('Custom Hint');
  });
});
