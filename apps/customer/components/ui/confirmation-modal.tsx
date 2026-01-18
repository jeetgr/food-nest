import { BlurView } from "expo-blur";
import React, { useEffect } from "react";
import { Modal, Text, View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmationModal({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmationModalProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 100 });
      scale.value = withSpring(1, { damping: 30, stiffness: 500 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.9, { duration: 150 });
    }
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, [isVisible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFill}>
        {/* Blurred Backdrop */}
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          </BlurView>
        </Animated.View>

        {/* Modal Content */}
        <View className="flex-1 items-center justify-center p-4">
          <Animated.View
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900"
            style={modalStyle}
          >
            <View className="p-6">
              <Text className="mb-2 text-center text-xl font-bold text-white">
                {title}
              </Text>
              <Text className="mb-6 text-center text-base text-neutral-400">
                {message}
              </Text>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={onClose}
                  className="flex-1 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-800 py-3.5 active:bg-neutral-700"
                >
                  <Text className="font-semibold text-white">{cancelText}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 items-center justify-center rounded-2xl py-3.5 ${
                    isDestructive
                      ? "bg-red-500 active:bg-red-600"
                      : "bg-orange-500 active:bg-orange-600"
                  }`}
                >
                  <Text className="font-semibold text-white">
                    {confirmText}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
