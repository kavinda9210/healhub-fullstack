import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../components/AuthContext';

const ForgotPasswordScreen: React.FC = () => {
  const { requestPasswordReset, openAuth } = useAuth();
  const [email, setEmail] = useState('');

  const handleRequest = async () => {
    await requestPasswordReset(email);
    openAuth('reset');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleRequest}>
        <Text style={styles.buttonText}>Send reset link (fake)</Text>
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

export default ForgotPasswordScreen;
