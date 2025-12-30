import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  translationKey: string;
}

const languageOptions: LanguageOption[] = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    translationKey: 'languages.english',
  },
  {
    id: 'si',
    name: 'Sinhala',
    nativeName: 'සිංහල',
    flag: '🇱🇰',
    translationKey: 'languages.sinhala',
  },
  {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇱🇰',
    translationKey: 'languages.tamil',
  },
];

interface LanguageSelectScreenProps {
  onLanguageSelect: (languageCode: string) => void;
}

const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({ onLanguageSelect }) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleConfirm = () => {
    onLanguageSelect(selectedLanguage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('language_select.title')}</Text>
          <Text style={styles.subtitle}>
            {t('language_select.subtitle')}
          </Text>
        </View>

        <View style={styles.languageList}>
          {languageOptions.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageCard,
                selectedLanguage === language.id && styles.languageCardSelected,
              ]}
              onPress={() => handleLanguageSelect(language.id)}
              activeOpacity={0.7}
            >
              <View style={styles.languageHeader}>
                <Text style={styles.flag}>{language.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{t(language.translationKey)}</Text>
                  <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                </View>
              </View>
              
              {selectedLanguage === language.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>{t('language_select.selected')}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>{t('language_select.continue')}</Text>
          </TouchableOpacity>
          
          <Text style={styles.note}>
            {t('language_select.note')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
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
    maxWidth: 300,
  },
  languageList: {
    marginBottom: 40,
  },
  languageCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  languageCardSelected: {
    borderColor: '#2E8B57',
    backgroundColor: '#F0FFF4',
    shadowColor: '#2E8B57',
    shadowOpacity: 0.1,
    elevation: 3,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 32,
    marginRight: 15,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  languageNativeName: {
    fontSize: 16,
    color: '#666',
  },
  selectedIndicator: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  confirmButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
    marginBottom: 20,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});

export default LanguageSelectScreen;