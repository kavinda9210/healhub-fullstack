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
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, dashboardInfo } = useAuth();

  const styles = createStyles(colors);

  const todaysSchedule = [
    {
      id: '1',
      patient: 'John Doe',
      time: '9:00 AM',
      type: 'Consultation',
      status: 'confirmed',
    },
    {
      id: '2',
      patient: 'Jane Smith',
      time: '10:30 AM',
      type: 'Follow-up',
      status: 'confirmed',
    },
    {
      id: '3',
      patient: 'Robert Johnson',
      time: '2:00 PM',
      type: 'New Patient',
      status: 'pending',
    },
  ];

  const quickActions = [
    {
      id: '1',
      title: t('dashboard.doctor.viewSchedule', 'View Schedule'),
      icon: 'calendar',
      color: '#4A90E2',
    },
    {
      id: '2',
      title: t('dashboard.doctor.patients', 'Patients'),
      icon: 'users',
      color: '#FF6B6B',
    },
    {
      id: '3',
      title: t('dashboard.doctor.prescriptions', 'Prescriptions'),
      icon: 'file-medical',
      color: '#2E8B57',
    },
    {
      id: '4',
      title: t('dashboard.doctor.reports', 'Reports'),
      icon: 'chart-bar',
      color: '#9C27B0',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader
  title={t('dashboard.doctor.title', 'Doctor Dashboard')}
  showBack={false} // Already correct - boolean false
  // showBack={false} is already boolean, not string
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
              {t('dashboard.doctor.welcome', 'Welcome, Dr.')}
            </Text>
            <Text style={styles.userName}>
              {user?.last_name}
            </Text>
            <Text style={styles.specialty}>
              {t('dashboard.doctor.specialty', 'Cardiologist')}
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user-md" size={60} color={colors.primary} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <FontAwesome name="calendar-check" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>
              {t('dashboard.doctor.todayAppointments', 'Today')}
            </Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome name="user-injured" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>
              {t('dashboard.doctor.totalPatients', 'Patients')}
            </Text>
          </View>
          <View style={styles.statCard}>
            <FontAwesome name="clock" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>
              {t('dashboard.doctor.pending', 'Pending')}
            </Text>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('dashboard.doctor.todaysSchedule', "Today's Schedule")}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>
                {t('dashboard.doctor.seeAll', 'See All')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {todaysSchedule.map((appointment) => (
            <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentTime}>
                <Text style={styles.timeText}>{appointment.time}</Text>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.patientName}>{appointment.patient}</Text>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: appointment.status === 'confirmed' ? colors.success : colors.warning }
              ]}>
                <Text style={styles.statusText}>
                  {appointment.status === 'confirmed' 
                    ? t('dashboard.doctor.confirmed', 'Confirmed')
                    : t('dashboard.doctor.pending', 'Pending')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.doctor.quickActions', 'Quick Actions')}
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <FontAwesome name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Meetings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.doctor.upcomingMeetings', 'Upcoming Meetings')}
          </Text>
          <View style={styles.meetingCard}>
            <FontAwesome name="video-camera" size={24} color={colors.primary} />
            <View style={styles.meetingInfo}>
              <Text style={styles.meetingTitle}>
                {t('dashboard.doctor.medicalConference', 'Medical Conference')}
              </Text>
              <Text style={styles.meetingTime}>Tomorrow, 3:00 PM</Text>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>
                {t('dashboard.doctor.join', 'Join')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
  appointmentTime: {
    width: 70,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  appointmentInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: colors.textSecondary,
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
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
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meetingInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  meetingTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DoctorDashboard;