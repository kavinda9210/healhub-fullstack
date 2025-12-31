import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../components/AuthContext';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import PatientDashboard from './patient/dashboard';
import DoctorDashboard from './doctor/dashboard';
import AdminDashboard from './admin/dashboard';
import AmbulanceDashboard from './ambulance/dashboard';

const AuthStack: React.FC = () => {
  const auth = useAuth();

  return (
    <>
      <Modal visible={auth.showAuthModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity onPress={auth.closeAuth}>
                  <Text style={styles.close}>Close</Text>
                </TouchableOpacity>
              </View>
              {auth.authScreen === 'login' && <LoginScreen />}
              {auth.authScreen === 'register' && <RegisterScreen />}
              {auth.authScreen === 'forgot' && <ForgotPasswordScreen />}
              {auth.authScreen === 'reset' && <ResetPasswordScreen />}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={auth.showDashboard} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={auth.closeDashboard}>
                <Text style={styles.close}>Close</Text>
              </TouchableOpacity>
            </View>
            { (auth.showDashboardRole || auth.user?.role) === 'patient' && <PatientDashboard /> }
            { (auth.showDashboardRole || auth.user?.role) === 'doctor' && <DoctorDashboard /> }
            { (auth.showDashboardRole || auth.user?.role) === 'admin' && <AdminDashboard /> }
            { (auth.showDashboardRole || auth.user?.role) === 'ambulance' && <AmbulanceDashboard /> }
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
  modalContent: { backgroundColor: '#fff', margin: 20, borderRadius: 12, padding: 16, maxHeight: '85%' },
  close: { color: '#0b84ff', fontWeight: '600', marginBottom: 8 },
});

export default AuthStack;
