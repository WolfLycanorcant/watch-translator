import React, { useMemo, useCallback } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IS_SMALL_SCREEN } from '@/lib/constants';

type WatchGestureProps = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  sensitivity?: number;
  disabled?: boolean;
  enableHaptics?: boolean;
};

export function WatchGestureHandler({
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap,
  onLongPress,
  children,
  sensitivity = IS_SMALL_SCREEN ? 150 : 250,
  disabled = false,
  enableHaptics = true
}: WatchGestureProps) {

  const triggerHaptic = useCallback((style: Haptics.ImpactFeedbackStyle) => {
    if (enableHaptics && !disabled) {
      Haptics.impactAsync(style);
    }
  }, [enableHaptics, disabled]);

  const swipe = useMemo(() => Gesture.Pan()
    .enabled(!disabled)
    .minDistance(IS_SMALL_SCREEN ? 6 : 8)
    .maxPointers(1)
    .onEnd((e) => {
      if (Math.abs(e.velocityX) > sensitivity) {
        if (e.velocityX > 0 && onSwipeRight) {
          runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
          runOnJS(onSwipeRight)();
        } else if (e.velocityX < 0 && onSwipeLeft) {
          runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
          runOnJS(onSwipeLeft)();
        }
      }
    }), [disabled, sensitivity, onSwipeLeft, onSwipeRight, triggerHaptic]);

  const doubleTap = useMemo(() => Gesture.Tap()
    .enabled(!disabled && !!onDoubleTap)
    .numberOfTaps(2)
    .maxDuration(500)
    .onStart(() => {
      if (onDoubleTap) {
        runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onDoubleTap)();
      }
    }), [disabled, onDoubleTap, triggerHaptic]);

  const longPress = useMemo(() => Gesture.LongPress()
    .enabled(!disabled && !!onLongPress)
    .minDuration(800)
    .onStart(() => {
      if (onLongPress) {
        runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Heavy);
        runOnJS(onLongPress)();
      }
    }), [disabled, onLongPress, triggerHaptic]);

  const composedGesture = useMemo(() => {
    const gestures = [swipe];

    if (onDoubleTap) gestures.push(doubleTap);
    if (onLongPress) gestures.push(longPress);

    return Gesture.Race(...gestures);
  }, [swipe, doubleTap, longPress, onDoubleTap, onLongPress]);

  return (
    <GestureDetector gesture={composedGesture}>
      {children}
    </GestureDetector>
  );
}
