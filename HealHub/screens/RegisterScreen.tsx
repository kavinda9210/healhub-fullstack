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
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthStackParamList } from '../types/navigation';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: new Date('2000-01-01'),
    address: '',
    city: '',
    state: '',
    country: 'US',
    postalCode: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const styles = createStyles(colors);

  const validateForm = () => {
    const newErrors: any = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('register.errors.firstNameRequired', 'First name is required');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('register.errors.lastNameRequired', 'Last name is required');
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = t('register.errors.emailOrPhoneRequired', 'Email or phone is required');
      newErrors.phone = t('register.errors.emailOrPhoneRequired', 'Email or phone is required');
    }

    // Email validation
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('register.errors.invalidEmail', 'Invalid email address');
      }
    }

    // Phone validation
    if (formData.phone.trim()) {
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = t('register.errors.invalidPhone', 'Invalid phone number');
      }
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = t('register.errors.passwordRequired', 'Password is required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('register.errors.passwordMinLength', 'Password must be at least 8 characters');
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('register.errors.confirmPasswordRequired', 'Confirm password is required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.errors.passwordsDontMatch', 'Passwords do not match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0],
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      await register(userData);
      
      Alert.alert(
        t('register.success.title', 'Registration Successful'),
        t('register.success.message', 'Please check your email for verification code.'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => navigation.navigate('VerifyEmail', { email: formData.email }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        t('register.errors.registrationFailed', 'Registration Failed'),
        error.response?.data?.message || error.message || t('register.errors.generalError', 'An error occurred'),
        [{ text: t('common.ok', 'OK') }]
      );
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dateOfBirth: selectedDate });
    }
  };

  const renderDatePicker = () => {
    if (showDatePicker) {
      return (
        <DateTimePicker
          value={formData.dateOfBirth}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      );
    }
    return null;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader
        title={t('register.title', 'Create Account')}
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
              {t('register.welcome', 'Join HealHub Today')}
            </Text>
            <Text style={styles.subtitle}>
              {t('register.subtitle', 'Create your account to get started')}
            </Text>

            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <InputField
                    label={t('register.firstName', 'First Name')}
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    placeholder={t('register.firstNamePlaceholder', 'Enter first name')}
                    error={errors.firstName}
                    required
                  />
                </View>
                <View style={styles.nameInput}>
                  <InputField
                    label={t('register.lastName', 'Last Name')}
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    placeholder={t('register.lastNamePlaceholder', 'Enter last name')}
                    error={errors.lastName}
                    required
                  />
                </View>
              </View>

              <InputField
                label={t('register.email', 'Email Address')}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder={t('register.emailPlaceholder', 'Enter email address')}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                icon="envelope"
              />

              <InputField
                label={t('register.phone', 'Phone Number')}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder={t('register.phonePlaceholder', 'Enter phone number')}
                keyboardType="phone-pad"
                error={errors.phone}
                icon="phone"
              />

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInputContainer}
              >
                <Text style={styles.dateLabel}>
                  {t('register.dateOfBirth', 'Date of Birth')}
                </Text>
                <View style={styles.dateInput}>
                  <Text style={styles.dateText}>{formatDate(formData.dateOfBirth)}</Text>
                </View>
              </TouchableOpacity>

              <InputField
                label={t('register.address', 'Address')}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder={t('register.addressPlaceholder', 'Enter address')}
                icon="home"
              />

              <View style={styles.locationRow}>
                <View style={styles.locationInput}>
                  <InputField
                    label={t('register.city', 'City')}
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                    placeholder={t('register.cityPlaceholder', 'City')}
                    icon="building"
                  />
                </View>
                <View style={styles.locationInput}>
                  <InputField
                    label={t('register.state', 'State')}
                    value={formData.state}
                    onChangeText={(text) => setFormData({ ...formData, state: text })}
                    placeholder={t('register.statePlaceholder', 'State')}
                    icon="map"
                  />
                </View>
              </View>

              <View style={styles.locationRow}>
                <View style={styles.locationInput}>
                  <InputField
                    label={t('register.country', 'Country')}
                    value={formData.country}
                    onChangeText={(text) => setFormData({ ...formData, country: text })}
                    placeholder={t('register.countryPlaceholder', 'Country')}
                    icon="globe"
                  />
                </View>
                <View style={styles.locationInput}>
                  <InputField
                    label={t('register.postalCode', 'Postal Code')}
                    value={formData.postalCode}
                    onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
                    placeholder={t('register.postalCodePlaceholder', 'Postal Code')}
                    keyboardType="number-pad"
                    icon="envelope-o"
                  />
                </View>
              </View>

              <InputField
                label={t('register.password', 'Password')}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder={t('register.passwordPlaceholder', 'Enter password')}
                secureTextEntry={!showPassword}
                error={errors.password}
                required
                icon="lock"
                rightIcon={showPassword ? 'eye-slash' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <InputField
                label={t('register.confirmPassword', 'Confirm Password')}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder={t('register.confirmPasswordPlaceholder', 'Confirm password')}
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
                required
                icon="lock"
                rightIcon={showConfirmPassword ? 'eye-slash' : 'eye'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              <Text style={styles.passwordHint}>
                {t('register.passwordHint', 'Password must be at least 8 characters long')}
              </Text>

              <AuthButton
                title={t('register.registerButton', 'Create Account')}
                onPress={handleRegister}
                loading={isLoading}
                disabled={!formData.firstName || !formData.lastName || 
                         (!formData.email && !formData.phone) || 
                         !formData.password || !formData.confirmPassword}
                style={styles.registerButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('register.haveAccount', 'Already have an account?')}
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginText}>
                  {t('register.login', 'Login')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {renderDatePicker()}
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
  },
  form: {
    marginBottom: 30,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
    marginRight: 12,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInput: {
    flex: 1,
    marginRight: 12,
  },
  passwordHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
  },
  registerButton: {
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
  loginText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;