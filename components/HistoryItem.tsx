import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface HistoryItemProps {
  item: {
    id: string;
    original: string;
    translation: string;
    timestamp: number;
    language?: string;
  };
  onPress?: (item: HistoryItemProps['item']) => void;
  onLongPress?: (item: HistoryItemProps['item']) => void;
}

const { width } = Dimensions.get('window');
const isSmallScreen = width < 200;

export const HistoryItem = memo<HistoryItemProps>(({ 
  item, 
  onPress, 
  onLongPress 
}) => {
  const formattedTime = useMemo(() => {
    const date = new Date(item.timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  }, [item.timestamp]);

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(item);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress(item);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const maxTextLength = isSmallScreen ? 20 : 40;

  const content = (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text 
          style={styles.originalText}
          numberOfLines={isSmallScreen ? 1 : 2}
          ellipsizeMode="tail"
        >
          {truncateText(item.original, maxTextLength)}
        </Text>
        <Text 
          style={styles.translationText}
          numberOfLines={isSmallScreen ? 1 : 2}
          ellipsizeMode="tail"
        >
          {truncateText(item.translation, maxTextLength)}
        </Text>
      </View>
      <View style={styles.metaContainer}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        {item.language && !isSmallScreen && (
          <Text style={styles.languageText}>
            {item.language.split('-')[0].toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={styles.touchable}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Translation: ${item.original} to ${item.translation}`}
        accessibilityHint="Tap to view details, long press for options"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});

HistoryItem.displayName = 'HistoryItem';

const styles = StyleSheet.create({
  touchable: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallScreen ? 8 : 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F2F2F',
    minHeight: isSmallScreen ? 50 : 70,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  originalText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 12 : 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  translationText: {
    color: '#A3A3A3',
    fontSize: isSmallScreen ? 10 : 14,
    lineHeight: isSmallScreen ? 14 : 18,
  },
  metaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeText: {
    color: '#A3A3A3',
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '400',
  },
  languageText: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '300',
  },
});
