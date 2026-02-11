import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandOrange } from '@/constants/theme';

type SimpleToastProps = {
  text1?: string;
  text2?: string;
  type?: string;
};

export function SimpleToast({ text1, text2, type }: SimpleToastProps) {
  const message = text2 || text1 || '';
  const isError = type === 'error';

  return (
    <View style={[styles.container, isError && styles.containerError]}>
      <Text style={[styles.text, isError && styles.textError]} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignSelf: 'center',
    maxWidth: '90%',
  },
  containerError: {
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,111,0,0.5)',
  },
  text: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  textError: {
    color: '#FFFFFF',
  },
});
