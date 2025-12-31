import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import ThemeToggle from '../theme/ThemeToggle';
import { useAuth } from '../components/AuthContext';
import ThemeSettings from '../theme/ThemeSettings';
import { changeLanguage } from '../i18n';

interface MainScreenProps {
  currentLanguage: string;
  onLanguageChange: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ currentLanguage, onLanguageChange }) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const styles = createStyles(colors, isDarkMode);
  const auth = useAuth() as any;

  const LanguageModal = () => (
    <Modal
      visible={showLanguageModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('language_select.title')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('language_select.subtitle')}
          </Text>

          <ScrollView style={styles.languageList}>
            {[
              { code: 'en', name: t('languages.english'), native: 'English', flag: '🇬🇧' },
              { code: 'si', name: t('languages.sinhala'), native: 'සිංහල', flag: '🇱🇰' },
              { code: 'ta', name: t('languages.tamil'), native: 'தமிழ்', flag: '🇱🇰' },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.modalLanguageCard,
                  currentLanguage === lang.code && styles.modalLanguageCardSelected,
                ]}
                onPress={async () => {
                  await changeLanguage(lang.code);
                  setShowLanguageModal(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.modalLanguageHeader}>
                  <Text style={styles.modalFlag}>{lang.flag}</Text>
                  <View style={styles.modalLanguageInfo}>
                    <Text style={styles.modalLanguageName}>{lang.name}</Text>
                    <Text style={styles.modalLanguageNative}>{lang.native}</Text>
                  </View>
                </View>
                {currentLanguage === lang.code && (
                  <View style={styles.modalSelectedIndicator}>
                    <Text style={styles.modalSelectedText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowLanguageModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>
              {t('language_select.continue')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <LanguageModal />
      
      <Modal
        visible={showThemeModal}
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <ThemeSettings onClose={() => setShowThemeModal(false)} />
      </Modal>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>HealHub</Text>
        <View style={styles.headerActions}>
          <ThemeToggle />
          <TouchableOpacity
            style={[styles.languageButton]}
            onPress={() => {
              if (auth.isAuthenticated) auth.openDashboard(auth.user?.role);
              else auth.openAuth('login');
            }}
          >
            <Text style={styles.languageButtonText}>
              {auth.isAuthenticated ? 'Dashboard' : 'Sign in'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.languageButtonText}>
              {currentLanguage.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>
            {t('subtitle')}
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>{t('intro.features') || 'App Features'}</Text>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💊</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                {t('intro.medicine_reminder.title')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('intro.medicine_reminder.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🤖</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                {t('intro.ai_detection.title')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('intro.ai_detection.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🚑</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                {t('intro.ambulance_find.title')}
              </Text>
              <Text style={styles.featureDescription}>
                {t('intro.ambulance_find.description')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{t('theme.settings') || 'Settings'}</Text>
          
          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => setShowThemeModal(true)}
          >
            <Text style={styles.settingIcon}>🎨</Text>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>
                {t('theme.title')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('theme.subtitle')}
              </Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.settingIcon}>🌐</Text>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>
                {t('language_select.title')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('language_select.subtitle')}
              </Text>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  languageButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  mainContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  settingsSection: {
    marginBottom: 30,
  },
  settingCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingIcon: {
    fontSize: 28,
    marginRight: 15,
    color: colors.primary,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  settingArrow: {
    fontSize: 20,
    color: colors.textTertiary,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  languageList: {
    maxHeight: 300,
  },
  modalLanguageCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalLanguageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  modalLanguageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalFlag: {
    fontSize: 28,
    marginRight: 15,
  },
  modalLanguageInfo: {
    flex: 1,
  },
  modalLanguageName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  modalLanguageNative: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalSelectedIndicator: {
    position: 'absolute',
    right: 18,
    top: 18,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSelectedText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MainScreen;