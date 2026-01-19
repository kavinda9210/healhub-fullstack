import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AuthHeader from '../components/AuthHeader';
import AuthButton from '../components/AuthButton';
import { AuthStackParamList } from '../types/navigation';

type VerifyEmailScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

const VerifyEmailScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<VerifyEmailScreenNavigationProp>();
  const route = useRoute<VerifyEmailScreenRouteProp>();
  const { verifyEmail, resendVerification, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const styles = createStyles(colors);

  useEffect(() => {
    // Extract email from route params
    const params = route.params || {};
    if (params.email) {
      setEmail(params.email);
    }
  }, [route.params]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length <= 1 && /^\d*$/.test(text)) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      // Auto-focus next input
      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all digits are entered
      if (index === 5 && text) {
        const verificationCode = newCode.join('');
        if (verificationCode.length === 6) {
          handleSubmit(verificationCode);
        }
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      setError(t('verifyEmail.errors.invalidCode', 'Please enter a 6-digit code'));
      return;
    }

    try {
      await verifyEmail(email, codeToVerify);
      setIsVerified(true);
      
      Alert.alert(
        t('verifyEmail.success.title', 'Email Verified'),
        t('verifyEmail.success.message', 'Your email has been successfully verified. You can now login.'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || t('verifyEmail.errors.verificationFailed', 'Verification failed'));
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      setIsResending(true);
      await resendVerification(email);
      setCountdown(60); // 60 seconds countdown
      Alert.alert(
        t('verifyEmail.resendSuccess.title', 'Code Sent'),
        t('verifyEmail.resendSuccess.message', 'A new verification code has been sent to your email.')
      );
    } catch (error: any) {
      Alert.alert(
        t('verifyEmail.resendError.title', 'Error'),
        error.response?.data?.message || error.message || t('verifyEmail.resendError.message', 'Failed to resend code')
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader
        title={t('verifyEmail.title', 'Verify Email')}
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
            {!isVerified ? (
              <>
                <Text style={styles.title}>
                  {t('verifyEmail.title', 'Verify Email')}
                </Text>
                <Text style={styles.subtitle}>
                  {t('verifyEmail.subtitle', 'Enter the 6-digit code sent to')}
                </Text>
                <Text style={styles.email}>
                  {email}
                </Text>

                <View style={styles.form}>
                  <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => { inputRefs.current[index] = ref; }}
                        style={[
                          styles.codeInput,
                          digit && styles.codeInputFilled,
                          error && styles.codeInputError,
                        ]}
                        value={digit}
                        onChangeText={(text) => handleCodeChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                      />
                    ))}
                  </View>

                  {error ? (
                    <Text style={styles.error}>{error}</Text>
                  ) : (
                    <Text style={styles.instructions}>
                      {t('verifyEmail.instructions', 'Enter the 6-digit verification code')}
                    </Text>
                  )}

                  <AuthButton
                    title={t('verifyEmail.verifyButton', 'Verify Email')}
                    onPress={() => handleSubmit()}
                    loading={isLoading}
                    disabled={Boolean(code.join('').length !== 6)}
                    style={styles.verifyButton}
                  />

                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                      {t('verifyEmail.didNotReceive', "Didn't receive the code?")}
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendCode}
                        disabled={Boolean(countdown > 0 || isResending)}
                    >
                      <Text style={[
                        styles.resendButton,
                        (countdown > 0 || isResending) && styles.resendButtonDisabled,
                      ]}>
                        {isResending
                          ? t('verifyEmail.resending', 'Resending...')
                          : countdown > 0
                          ? t('verifyEmail.resendCountdown', 'Resend in {countdown}s', { countdown })
                          : t('verifyEmail.resend', 'Resend Code')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>
                  {t('verifyEmail.success.title', 'Email Verified')}
                </Text>
                <Text style={styles.successMessage}>
                  {t('verifyEmail.success.message', 'Your email has been successfully verified.')}
                </Text>
                <Text style={styles.successNote}>
                  {t('verifyEmail.success.note', 'You can now login to your account.')}
                </Text>

                <AuthButton
                  title={t('verifyEmail.loginButton', 'Go to Login')}
                  onPress={handleBackToLogin}
                  style={styles.loginButton}
                />
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('verifyEmail.backToLogin', 'Back to')}
              </Text>
              <Text style={styles.loginText} onPress={handleBackToLogin}>
                {t('verifyEmail.login', 'Login')}
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
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceVariant,
  },
  codeInputError: {
    borderColor: colors.error,
  },
  instructions: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  error: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  verifyButton: {
    marginTop: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  resendButton: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: colors.textTertiary,
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
  loginButton: {
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
    marginRight: 4,
  },
  loginText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default VerifyEmailScreen;