import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
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
import { FontAwesome } from '@expo/vector-icons';
import { AuthStackParamList } from '../types/navigation';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const styles = createStyles(colors);

  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier = t('login.errors.identifierRequired', 'Email or phone is required');
    }

    if (!password.trim()) {
      newErrors.password = t('login.errors.passwordRequired', 'Password is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(identifier, password);
      // Navigation is handled by AuthContext and Navigation container
    } catch (error: any) {
      Alert.alert(
        t('login.errors.loginFailed', 'Login Failed'),
        error.response?.data?.message || error.message || t('login.errors.invalidCredentials', 'Invalid credentials'),
        [{ text: t('common.ok', 'OK') }]
      );
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handlePhoneLogin = () => {
    // You can implement phone login logic here
    Alert.alert('Info', 'Phone login will be implemented');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader
        title={t('login.title', 'Login to HealHub')}
        showBack={false}
        showClose={false}
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
            <Text style={styles.welcomeText}>
              {t('login.welcome', 'Welcome Back')}
            </Text>
            <Text style={styles.subtitle}>
              {t('login.subtitle', 'Sign in to continue to your account')}
            </Text>

            <View style={styles.form}>
              <InputField
                label={t('login.identifier', 'Email or Phone Number')}
                value={identifier}
                onChangeText={setIdentifier}
                placeholder={t('login.identifierPlaceholder', 'Enter email or phone number')}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.identifier}
                required
                icon="user"
              />

              <InputField
                label={t('login.password', 'Password')}
                value={password}
                onChangeText={setPassword}
                placeholder={t('login.passwordPlaceholder', 'Enter your password')}
                secureTextEntry={!showPassword} // CHANGED: Removed Boolean() wrapper
                error={errors.password}
                required
                icon="lock"
                rightIcon={showPassword ? 'eye-slash' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  {t('login.forgotPassword', 'Forgot Password?')}
                </Text>
              </TouchableOpacity>

              <AuthButton
                title={t('login.loginButton', 'Login')}
                onPress={handleLogin}
                loading={isLoading}
                disabled={Boolean(!identifier || !password)}
                style={styles.loginButton}
              />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>
                  {t('login.or', 'OR')}
                </Text>
                <View style={styles.divider} />
              </View>

              <AuthButton
                title={t('login.loginWithPhone', 'Login with Phone')}
                onPress={handlePhoneLogin}
                variant="outline"
                icon={<FontAwesome name="phone" size={18} color={colors.primary} />}
                style={styles.phoneButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('login.noAccount', "Don't have an account?")}
              </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerText}>
                  {t('login.register', 'Register')}
                </Text>
              </TouchableOpacity>
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
    paddingTop: 20,
  },
  welcomeText: {
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
  },
  form: {
    marginBottom: 30,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  phoneButton: {
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
    marginRight: 8,
  },
  registerText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;