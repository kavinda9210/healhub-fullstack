import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../components/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user, logout, closeDashboard } = useAuth() as any;

  const handleLogout = () => {
    logout();
    closeDashboard();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome{user?.email ? `, ${user.email}` : ''}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 16, marginBottom: 18 },
  button: { backgroundColor: '#e53935', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default AdminDashboard;
