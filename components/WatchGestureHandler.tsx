import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type WatchGestureProps = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDoubleTap?: () => void;
  children: React.ReactNode;
  sensitivity?: number;
};

export function WatchGestureHandler({
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap,
  children,
  sensitivity = 250
}: WatchGestureProps) {
  const swipe = Gesture.Pan()
    .minDistance(8)
    .onEnd((e) => {
      if (Math.abs(e.velocityX) > sensitivity) {
        if (e.velocityX > 0 && onSwipeRight) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          runOnJS(onSwipeRight)();
        } else if (e.velocityX < 0 && onSwipeLeft) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          runOnJS(onSwipeLeft)();
        }
      }
    });

  const tap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (onDoubleTap) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onDoubleTap)();
      }
    });

  return (
    <GestureDetector gesture={Gesture.Race(swipe, tap)}>
      {children}
    </GestureDetector>
  );
}
