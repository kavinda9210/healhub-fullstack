import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Animated } from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next';
import HealHubLogo from './components/HealHubLogo';
import LanguageSelectScreen from './screens/LanguageSelectScreen';
import i18n, { initI18n, changeLanguage } from './i18n';
import IntroScreen from './screens/IntroScreen';

// Create a wrapper component that uses i18n
function AppContent() {
  const { t } = useTranslation();
  const [appState, setAppState] = useState<'splash' | 'language' | 'intro' | 'main'>('splash');
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Initialize app - show splash first
  useEffect(() => {
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
      
      <View style={styles.mainContent}>
        <Text style={styles.welcomeText}>{t('welcome')}</Text>
        <Text style={styles.subtitle}>
          {t('subtitle')}
        </Text>
        
        <View style={styles.languageIndicator}>
          <Text style={styles.languageText}>
            Current Language: {currentLanguage.toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• {t('features.health_tracking')}</Text>
          <Text style={styles.featureItem}>• {t('features.appointments')}</Text>
          <Text style={styles.featureItem}>• {t('features.medical_records')}</Text>
          <Text style={styles.featureItem}>• {t('features.virtual_consultations')}</Text>
        </View>
        
        <View style={styles.changeLanguageContainer}>
          <Text style={styles.changeLanguageText}>
            To change language, close and reopen the app
          </Text>
        </View>
      </View>
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
              translation: {
                welcome: 'Welcome to HealHub!',
                subtitle: 'Your healthcare companion app is ready.',
                features: {
                  health_tracking: 'Health Tracking',
                  appointments: 'Appointment Scheduling',
                  medical_records: 'Medical Records Access',
                  virtual_consultations: 'Virtual Consultations'
                },
                language_select: {
                  title: 'Choose Your Language',
                  subtitle: 'Select your preferred language for the app',
                  continue: 'Continue',
                  note: 'You can change the language anytime from settings',
                  selected: 'Selected'
                },
                languages: {
                  english: 'English',
                  sinhala: 'Sinhala',
                  tamil: 'Tamil'
                }
              }
            }
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
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  languageIndicator: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  languageText: {
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '600',
  },
  featureList: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    paddingLeft: 5,
  },
  changeLanguageContainer: {
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    maxWidth: 300,
  },
  changeLanguageText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 20,
  },
});