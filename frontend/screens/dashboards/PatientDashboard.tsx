import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';



const PatientDashboard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, dashboardInfo } = useAuth();

  const styles = createStyles(colors);

  const features = [
    {
      id: '1',
      title: t('dashboard.patient.appointments', 'Appointments'),
      description: t('dashboard.patient.appointmentsDesc', 'Book and manage your appointments'),
      icon: 'calendar',
      color: '#4A90E2',
      route: 'Appointments',
    },
    {
      id: '2',
      title: t('dashboard.patient.prescriptions', 'Prescriptions'),
      description: t('dashboard.patient.prescriptionsDesc', 'View and manage your prescriptions'),
      icon: 'file-medical',
      color: '#FF6B6B',
      route: 'Prescriptions',
    },
    {
      id: '3',
      title: t('dashboard.patient.reminders', 'Medicine Reminders'),
      description: t('dashboard.patient.remindersDesc', 'Set and track medication reminders'),
      icon: 'bell',
      color: '#2E8B57',
      route: 'Reminders',
    },
    {
      id: '4',
      title: t('dashboard.patient.records', 'Health Records'),
      description: t('dashboard.patient.recordsDesc', 'Access your medical history'),
      icon: 'folder-open',
      color: '#9C27B0',
      route: 'HealthRecords',
    },
    {
      id: '5',
      title: t('dashboard.patient.aiDetection', 'AI Detection'),
      description: t('dashboard.patient.aiDetectionDesc', 'Scan skin conditions with AI'),
      icon: 'robot',
      color: '#FF9800',
      route: 'AIDetection',
    },
    {
      id: '6',
      title: t('dashboard.patient.ambulance', 'Ambulance'),
      description: t('dashboard.patient.ambulanceDesc', 'Find nearest ambulance service'),
      icon: 'ambulance',
      color: '#F44336',
      route: 'Ambulance',
    },
  ];

  const upcomingAppointments = [
    {
      id: '1',
      doctor: 'Dr. Smith',
      specialty: 'Cardiology',
      date: 'Today, 2:30 PM',
      status: 'confirmed',
    },
    {
      id: '2',
      doctor: 'Dr. Johnson',
      specialty: 'Dermatology',
      date: 'Tomorrow, 10:00 AM',
      status: 'pending',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader
        title={t('dashboard.patient.title', 'Patient Dashboard')}
        showBack={false}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>
              {t('dashboard.patient.welcome', 'Welcome back,')}
            </Text>
            <Text style={styles.userName}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user-circle" size={60} color={colors.primary} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <FontAwesome5 name="calendar-check" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>
              {t('dashboard.patient.upcoming', 'Upcoming')}
            </Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome5 name="pills" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>
              {t('dashboard.patient.medicines', 'Medicines')}
            </Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome5 name="file-medical" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>
              {t('dashboard.patient.records', 'Records')}
            </Text>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('dashboard.patient.upcomingAppointments', 'Upcoming Appointments')}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>
                {t('dashboard.patient.seeAll', 'See All')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {upcomingAppointments.map((appointment) => (
            <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentInfo}>
                <Text style={styles.doctorName}>{appointment.doctor}</Text>
                <Text style={styles.specialty}>{appointment.specialty}</Text>
                <Text style={styles.appointmentDate}>{appointment.date}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: appointment.status === 'confirmed' ? colors.success : colors.warning }
              ]}>
                <Text style={styles.statusText}>
                  {appointment.status === 'confirmed' 
                    ? t('dashboard.patient.confirmed', 'Confirmed')
                    : t('dashboard.patient.pending', 'Pending')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.patient.features', 'Features')}
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity key={feature.id} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <FontAwesome name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Section */}
        <TouchableOpacity style={styles.emergencyButton}>
          <FontAwesome name="ambulance" size={24} color="#FFFFFF" />
          <Text style={styles.emergencyButtonText}>
            {t('dashboard.patient.emergency', 'Emergency Assistance')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.surface,
    marginBottom: 20,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  avatarContainer: {
    marginLeft: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    marginHorizontal: 6,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F44336',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 30,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});

export default PatientDashboard;