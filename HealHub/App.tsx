import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next';
import HealHubLogo from './components/HealHubLogo';
import LanguageSelectScreen from './screens/LanguageSelectScreen';
import IntroScreen from './screens/IntroScreen';
import i18n, { initI18n, changeLanguage } from './i18n';

// Create a wrapper component that uses i18n
function AppContent() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [appState, setAppState] = useState<'splash' | 'language' | 'intro' | 'main'>('splash');
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Initialize app - show splash first
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize i18n
        await initI18n();
        const lang = i18nInstance.language || 'en';
        setCurrentLanguage(lang);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After splash, show language selection
        setAppState('language');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setAppState('intro'); // Go to intro screen
    } catch (error) {
      console.error('Error changing language:', error);
      setAppState('intro'); // Fallback to intro screen
    }
  };

  const handleChangeLanguage = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

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
                onPress={() => handleChangeLanguage(lang.code)}
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

  // Splash Screen
  if (appState === 'splash') {
    return (
      <Animated.View 
        style={[
          styles.splashContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <StatusBar 
          barStyle="dark-content"
          backgroundColor="#f8f9fa"
          translucent={false}
        />
        <HealHubLogo />
      </Animated.View>
    );
  }

  // Language Selection Screen
  if (appState === 'language') {
    return <LanguageSelectScreen onLanguageSelect={handleLanguageSelect} />;
  }

  // Intro Screen
  if (appState === 'intro') {
    return <IntroScreen onComplete={() => setAppState('main')} />;
  }

  // Main App Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="#f8f9fa"
        translucent={false}
      />
      
      <LanguageModal />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HealHub</Text>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowLanguageModal(true)}
        >
          <Text style={styles.languageButtonText}>
            {currentLanguage.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>
            {t('subtitle')}
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>App Features</Text>
          
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

        <View style={styles.additionalFeatures}>
          <Text style={styles.sectionTitle}>Additional Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• {t('features.health_tracking')}</Text>
            <Text style={styles.featureItem}>• {t('features.appointments')}</Text>
            <Text style={styles.featureItem}>• {t('features.medical_records')}</Text>
            <Text style={styles.featureItem}>• {t('features.virtual_consultations')}</Text>
          </View>
        </View>

        <View style={styles.changeLanguageContainer}>
          <TouchableOpacity
            style={styles.changeLanguageButton}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.changeLanguageButtonText}>
              Change Language ({currentLanguage.toUpperCase()})
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.note}>
            You can change the language anytime
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Main App component
export default function App() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        await initI18n();
        setIsI18nReady(true);
      } catch (error) {
        console.error('Error initializing i18n:', error);
        // Initialize with default settings
        i18n.init({
          resources: {
            en: {
              translation: require('./i18n/en.json'),
            },
          },
          lng: 'en',
          fallbackLng: 'en',
          interpolation: {
            escapeValue: false,
          },
        });
        setIsI18nReady(true);
      }
    };

    initializeI18n();
  }, []);

  if (!isI18nReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <Text>Initializing...</Text>
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AppContent />
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  languageButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
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
    color: '#2E8B57',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  additionalFeatures: {
    marginBottom: 30,
  },
  featureList: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    paddingLeft: 5,
  },
  changeLanguageContainer: {
    alignItems: 'center',
  },
  changeLanguageButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  changeLanguageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  languageList: {
    maxHeight: 300,
  },
  modalLanguageCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalLanguageCardSelected: {
    borderColor: '#2E8B57',
    backgroundColor: '#E8F5E9',
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
    color: '#333',
    marginBottom: 4,
  },
  modalLanguageNative: {
    fontSize: 16,
    color: '#666',
  },
  modalSelectedIndicator: {
    position: 'absolute',
    right: 18,
    top: 18,
    backgroundColor: '#2E8B57',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSelectedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});