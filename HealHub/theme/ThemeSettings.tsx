import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from './ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeSettings: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { colors, themeMode, setThemeMode, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const themeOptions = [
    { id: 'light' as const, label: t('theme.light'), icon: '☀️' },
    { id: 'dark' as const, label: t('theme.dark'), icon: '🌙' },
    { id: 'auto' as const, label: t('theme.auto'), icon: '⚙️' },
  ];

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('theme.title')}
        </Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>
              {t('theme.close')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>
          {t('theme.subtitle')}
        </Text>

        <View style={styles.optionsContainer}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                { 
                  backgroundColor: colors.surface,
                  borderColor: themeMode === option.id ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setThemeMode(option.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>
                {option.icon}
              </Text>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {t(`theme.${option.id}_description`)}
                </Text>
              </View>
              {themeMode === option.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewTitle}>
            {t('theme.preview')}
          </Text>
          <View style={styles.previewContent}>
            <Text style={styles.previewText}>
              {t('theme.preview_text')}
            </Text>
            <View style={styles.previewBox}>
              <Text style={styles.previewBoxText}>
                {t('theme.preview_box')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 25,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  selectedIndicator: {
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  preview: {
    borderRadius: 15,
    padding: 20,
    backgroundColor: colors.surfaceVariant,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  previewContent: {
    borderRadius: 10,
    padding: 20,
    backgroundColor: colors.surface,
  },
  previewText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
    lineHeight: 24,
  },
  previewBox: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  previewBoxText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default ThemeSettings;