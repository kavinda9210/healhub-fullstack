import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../theme/ThemeContext';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  secureTextEntry?: boolean;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  secureTextEntry = false, // Default to false if undefined
  icon,
  rightIcon,
  onRightIconPress,
  required = false,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  // DEBUG: Log what we receive
  console.log('🔍 InputField DEBUG - secureTextEntry:', secureTextEntry, 'type:', typeof secureTextEntry, 'isBoolean?', typeof secureTextEntry === 'boolean');
  
  // Ensure secureTextEntry is boolean
  const isSecure = Boolean(secureTextEntry);
  const [showPassword, setShowPassword] = useState(!isSecure);

  const styles = createStyles(colors);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // DEBUG: Log what we pass to TextInput
  console.log('🔍 InputField passing to TextInput - secureTextEntry:', isSecure && !showPassword);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {icon && (
          <FontAwesome
            name={icon as any}
            size={18}
            color={isFocused ? colors.primary : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isSecure && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {isSecure && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIconButton}
          >
            <FontAwesome
              name={showPassword ? 'eye-slash' : 'eye'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isSecure && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
          >
            <FontAwesome
              name={rightIcon as any}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  required: {
    color: colors.error,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  rightIconButton: {
    padding: 8,
    marginLeft: 4,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default InputField;