import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../components/AuthContext';

const ResetPasswordScreen: React.FC = () => {
  const { resetPassword, openAuth } = useAuth();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');

  const handleReset = async () => {
    await resetPassword(token, password);
    openAuth('login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        placeholder="Reset token"
        value={token}
        onChangeText={setToken}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="New password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset password</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => openAuth('login')} style={{ marginTop: 12 }}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0b84ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: '#0b84ff' },
});

export default ResetPasswordScreen;
