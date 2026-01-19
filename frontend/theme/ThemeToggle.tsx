import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surfaceVariant }]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={[styles.toggle, { backgroundColor: colors.primary }]}>
        <View style={[
          styles.circle,
          { 
            backgroundColor: colors.surface,
            transform: [{ translateX: isDarkMode ? 20 : 0 }]
          }
        ]} />
      </View>
      <Text style={[styles.text, { color: colors.text }]}>
        {isDarkMode ? '🌙' : '☀️'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggle: {
    width: 40,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    padding: 2,
    marginRight: 6,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
  },
});

export default ThemeToggle;