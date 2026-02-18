import { Tabs } from 'expo-router';
import React from 'react';
import { House, Calendar, Dumbbell, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.textTertiary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingTop: 16,
          paddingBottom: insets.bottom,
          backgroundColor: theme.background,
          borderTopWidth: 0,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '기록',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: '트레이닝',
          tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '마이',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen
        name="run"
        options={{ href: null, tabBarStyle: { display: 'none' } }}
      />
    </Tabs>
  );
}
