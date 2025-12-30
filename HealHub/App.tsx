import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import HealHubLogo from './components/HealHubLogo';
import LanguageSelectScreen from './screens/LanguageSelectScreen';
import IntroScreen from './screens/IntroScreen';
import MainScreen from './screens/MainScreen';
import i18n, { initI18n } from './i18n';

// Create a component that listens to i18n language changes
function AppContent() {
  const { i18n: i18nInstance } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const [appState, setAppState] = useState<'splash' | 'language' | 'intro' | 'main'>('splash');
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Listen to language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18nInstance.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChanged);
    };
  }, [i18nInstance]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
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
        setAppState('language');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await i18nInstance.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      setAppState('intro');
    } catch (error) {
      console.error('Error changing language:', error);
      setAppState('intro');
    }
  };

  if (appState === 'splash') {
    return (
      <Animated.View 
        style={[
          styles.splashContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: colors.background,
          }
        ]}
      >
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <HealHubLogo />
      </Animated.View>
    );
  }

  if (appState === 'language') {
    return <LanguageSelectScreen onLanguageSelect={handleLanguageSelect} />;
  }

  if (appState === 'intro') {
    return <IntroScreen onComplete={() => setAppState('main')} />;
  }

  return (
    <MainScreen
      currentLanguage={currentLanguage}
      onLanguageChange={() => setAppState('language')}
    />
  );
}

function App() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        await initI18n();
        setIsI18nReady(true);
      } catch (error) {
        console.error('Error initializing i18n:', error);
        setIsI18nReady(true);
      }
    };

    initializeI18n();
  }, []);

  if (!isI18nReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <Text>Initializing...</Text>
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;