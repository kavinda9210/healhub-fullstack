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



const AmbulanceDashboard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, dashboardInfo } = useAuth();

  const styles = createStyles(colors);

  const emergencyCalls = [
    {
      id: '1',
      location: '123 Main St',
      patient: 'John Smith',
      priority: 'high',
      time: '5 minutes ago',
      status: 'pending',
    },
    {
      id: '2',
      location: '456 Oak Ave',
      patient: 'Sarah Johnson',
      priority: 'medium',
      time: '15 minutes ago',
      status: 'assigned',
    },
    {
      id: '3',
      location: '789 Pine Rd',
      patient: 'Mike Brown',
      priority: 'low',
      time: '25 minutes ago',
      status: 'enroute',
    },
  ];

  const ambulanceStatus = {
    status: 'available',
    location: 'Central Hospital',
    driver: 'Alex Wilson',
    ambulanceNumber: 'AMB-007',
  };

  const quickActions = [
    {
      id: '1',
      title: t('dashboard.ambulance.acceptCall', 'Accept Call'),
      icon: 'phone',
      color: '#4A90E2',
    },
    {
      id: '2',
      title: t('dashboard.ambulance.updateStatus', 'Update Status'),
      icon: 'sync',
      color: '#FF6B6B',
    },
    {
      id: '3',
      title: t('dashboard.ambulance.navigation', 'Navigation'),
      icon: 'map-marker-alt',
      color: '#2E8B57',
    },
    {
      id: '4',
      title: t('dashboard.ambulance.reports', 'Reports'),
      icon: 'file-alt',
      color: '#9C27B0',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'assigned':
        return colors.info;
      case 'enroute':
        return colors.primary;
      case 'completed':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader
        title={t('dashboard.ambulance.title', 'Ambulance Dashboard')}
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
              {t('dashboard.ambulance.welcome', 'Welcome,')}
            </Text>
            <Text style={styles.userName}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.role}>
              {t('dashboard.ambulance.role', 'Ambulance Staff')}
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <FontAwesome name="ambulance" size={60} color={colors.primary} />
          </View>
        </View>

        {/* Ambulance Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>
                {t('dashboard.ambulance.currentStatus', 'Current Status')}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: ambulanceStatus.status === 'available' ? colors.success : colors.error }
              ]}>
                <Text style={styles.statusBadgeText}>
                  {ambulanceStatus.status === 'available' 
                    ? t('dashboard.ambulance.available', 'Available')
                    : t('dashboard.ambulance.busy', 'Busy')}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusInfo}>
              <View style={styles.statusItem}>
                <FontAwesome5 name="map-marker-alt" size={16} color={colors.textSecondary} />
                <Text style={styles.statusText}>{ambulanceStatus.location}</Text>
              </View>
              <View style={styles.statusItem}>
                <FontAwesome name="user" size={16} color={colors.textSecondary} />
                <Text style={styles.statusText}>{ambulanceStatus.driver}</Text>
              </View>
              <View style={styles.statusItem}>
                <FontAwesome name="ambulance" size={16} color={colors.textSecondary} />
                <Text style={styles.statusText}>{ambulanceStatus.ambulanceNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Calls */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('dashboard.ambulance.emergencyCalls', 'Emergency Calls')}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>
                {t('dashboard.ambulance.seeAll', 'See All')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {emergencyCalls.map((call) => (
            <TouchableOpacity key={call.id} style={styles.callCard}>
              <View style={styles.callPriority}>
                <View style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(call.priority) }
                ]} />
                <Text style={[
                  styles.priorityText,
                  { color: getPriorityColor(call.priority) }
                ]}>
                  {call.priority.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.callInfo}>
                <Text style={styles.patientName}>{call.patient}</Text>
                <Text style={styles.callLocation}>{call.location}</Text>
                <Text style={styles.callTime}>{call.time}</Text>
              </View>
              
              <View style={[
                styles.callStatus,
                { backgroundColor: getStatusColor(call.status) }
              ]}>
                <Text style={styles.callStatusText}>
                  {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.ambulance.quickActions', 'Quick Actions')}
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

        {/* Emergency Button */}
        <TouchableOpacity style={styles.emergencyButton}>
          <FontAwesome name="exclamation-triangle" size={24} color="#FFFFFF" />
          <Text style={styles.emergencyButtonText}>
            {t('dashboard.ambulance.emergencyMode', 'Emergency Mode')}
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
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  avatarContainer: {
    marginLeft: 16,
  },
  statusSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusInfo: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
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
  callCard: {
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
  callPriority: {
    alignItems: 'center',
    marginRight: 16,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  callInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  callLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  callTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  callStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  callStatusText: {
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

export default AmbulanceDashboard;