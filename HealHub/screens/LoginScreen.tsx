import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useState } from 'react';

const LoginScreen: React.FC = () => {
  const { login, openAuth } = useAuth() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient'|'admin'|'doctor'|'ambulance'>('patient');

  const handleLogin = async () => {
    await login(email, password, role);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {['patient','doctor','admin','ambulance'].map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRole(r as any)}
            style={{ padding: 8, borderRadius: 8, backgroundColor: role===r? '#0b84ff':'#eee' }}
          >
            <Text style={{ color: role===r? '#fff':'#000' }}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity onPress={() => openAuth('forgot')}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openAuth('register')}>
          <Text style={styles.link}>Register</Text>
        </TouchableOpacity>
      </View>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  link: { color: '#0b84ff' },
});

export default LoginScreen;
