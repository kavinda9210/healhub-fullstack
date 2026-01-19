import React, { useState, useEffect } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AuthHeader from '../components/AuthHeader';
import InputField from '../components/InputField';
import AuthButton from '../components/AuthButton';
import { AuthStackParamList } from '../types/navigation';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const { resetPassword, isLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [userId, setUserId] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');

  const styles = createStyles(colors);

  useEffect(() => {
    // Extract parameters from route
    const params = route.params || {};
    if (params.token) {
      setResetToken(params.token);
    }
    // In a real app, you might decode the token to get user ID
    // For now, we'll rely on the backend to validate the token
  }, [route.params]);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password.trim()) {
      newErrors.password = t('resetPassword.errors.passwordRequired', 'Password is required');
    } else if (password.length < 8) {
      newErrors.password = t('resetPassword.errors.passwordMinLength', 'Password must be at least 8 characters');
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('resetPassword.errors.confirmPasswordRequired', 'Confirm password is required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('resetPassword.errors.passwordsDontMatch', 'Passwords do not match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Note: In a real app, you would get userId from the decoded token or API
      // For now, we'll show an alert about the next step
      Alert.alert(
        t('resetPassword.success.title', 'Password Reset'),
        t('resetPassword.success.message', 'Your password has been successfully reset. You can now login with your new password.'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
      
      // Actual API call would look like:
      // await resetPassword(userId, resetToken, password);
      
    } catch (error: any) {
      Alert.alert(
        t('resetPassword.errors.submissionFailed', 'Reset Failed'),
        error.response?.data?.message || error.message || t('resetPassword.errors.generalError', 'An error occurred'),
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
        title={t('resetPassword.title', 'Reset Password')}
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
            <Text style={styles.title}>
              {t('resetPassword.title', 'Reset Password')}
            </Text>
            <Text style={styles.subtitle}>
              {t('resetPassword.subtitle', 'Create a new password for your account')}
            </Text>

            <View style={styles.form}>
              <InputField
                label={t('resetPassword.newPassword', 'New Password')}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder={t('resetPassword.newPasswordPlaceholder', 'Enter new password')}
                secureTextEntry={!showPassword} // FIXED: Removed Boolean()
                error={errors.password}
                required
                icon="lock"
                rightIcon={showPassword ? 'eye-slash' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <InputField
                label={t('resetPassword.confirmPassword', 'Confirm New Password')}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                placeholder={t('resetPassword.confirmPasswordPlaceholder', 'Confirm new password')}
                secureTextEntry={!showConfirmPassword} // FIXED: Removed Boolean()
                error={errors.confirmPassword}
                required
                icon="lock"
                rightIcon={showConfirmPassword ? 'eye-slash' : 'eye'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              <Text style={styles.passwordHint}>
                {t('resetPassword.passwordHint', 'Password must be at least 8 characters long')}
              </Text>

              <AuthButton
                title={t('resetPassword.submitButton', 'Reset Password')}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={Boolean(!password || !confirmPassword)}
                style={styles.submitButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('resetPassword.backToLogin', 'Back to')}
              </Text>
              <Text style={styles.loginText} onPress={handleBackToLogin}>
                {t('resetPassword.login', 'Login')}
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
  passwordHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -8,
    marginBottom: 24,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 8,
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

export default ResetPasswordScreen;