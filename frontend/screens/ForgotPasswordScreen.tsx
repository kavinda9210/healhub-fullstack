import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AuthHeader from '../components/AuthHeader';
import InputField from '../components/InputField';
import AuthButton from '../components/AuthButton';
import { AuthStackParamList } from '../types/navigation';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { forgotPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const styles = createStyles(colors);

  const validateEmail = () => {
    if (!email.trim()) {
      setError(t('forgotPassword.errors.emailRequired', 'Email is required'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('forgotPassword.errors.invalidEmail', 'Invalid email address'));
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) return;

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      
      Alert.alert(
        t('forgotPassword.success.title', 'Reset Link Sent'),
        t('forgotPassword.success.message', 'Check your email for password reset instructions.'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        t('forgotPassword.errors.submissionFailed', 'Request Failed'),
        error.response?.data?.message || error.message || t('forgotPassword.errors.generalError', 'An error occurred'),
        [{ text: t('common.ok', 'OK') }]
      );
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader
        title={t('forgotPassword.title', 'Forgot Password')}
        showBack
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {!isSubmitted ? (
              <>
                <Text style={styles.title}>
                  {t('forgotPassword.title', 'Forgot Password')}
                </Text>
                <Text style={styles.subtitle}>
                  {t('forgotPassword.subtitle', 'Enter your email address to receive password reset instructions')}
                </Text>

                <View style={styles.form}>
                  <InputField
                    label={t('forgotPassword.email', 'Email Address')}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    placeholder={t('forgotPassword.emailPlaceholder', 'Enter your email address')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={error}
                    required
                    icon="envelope"
                  />

                  <Text style={styles.instructions}>
                    {t('forgotPassword.instructions', 'We will send you an email with instructions to reset your password.')}
                  </Text>

                  <AuthButton
                    title={t('forgotPassword.submitButton', 'Send Reset Link')}
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={Boolean(!email.trim())}
                    style={styles.submitButton}
                  />
                </View>
              </>
            ) : (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>
                  {t('forgotPassword.success.title', 'Reset Link Sent')}
                </Text>
                <Text style={styles.successMessage}>
                  {t('forgotPassword.success.checkEmail', 'Check your email for password reset instructions.')}
                </Text>
                <Text style={styles.successNote}>
                  {t('forgotPassword.success.note', 'If you don\'t see the email, check your spam folder.')}
                </Text>

                <AuthButton
                  title={t('forgotPassword.backToLogin', 'Back to Login')}
                  onPress={handleBackToLogin}
                  style={styles.backButton}
                />
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('forgotPassword.rememberPassword', 'Remember your password?')}
              </Text>
              <Text style={styles.loginText} onPress={handleBackToLogin}>
                {t('forgotPassword.login', 'Login')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 30,
  },
  instructions: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    fontSize: 64,
    color: colors.success,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  successNote: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    marginTop: 16,
    width: '100%',
    maxWidth: 200,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  loginText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;