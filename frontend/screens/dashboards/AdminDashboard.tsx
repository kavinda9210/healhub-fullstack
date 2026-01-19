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



const AdminDashboard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, dashboardInfo } = useAuth();

  const styles = createStyles(colors);

  const systemStats = [
    {
      id: '1',
      title: t('dashboard.admin.totalUsers', 'Total Users'),
      value: '1,245',
      change: '+12%',
      icon: 'users',
      color: '#4A90E2',
    },
    {
      id: '2',
      title: t('dashboard.admin.activeDoctors', 'Active Doctors'),
      value: '45',
      change: '+5%',
      icon: 'user-md',
      color: '#FF6B6B',
    },
    {
      id: '3',
      title: t('dashboard.admin.appointments', 'Appointments'),
      value: '89',
      change: '+23%',
      icon: 'calendar',
      color: '#2E8B57',
    },
    {
      id: '4',
      title: t('dashboard.admin.revenue', 'Revenue'),
      value: '$12,450',
      change: '+18%',
      icon: 'dollar-sign',
      color: '#9C27B0',
    },
  ];

  const quickActions = [
    {
      id: '1',
      title: t('dashboard.admin.userManagement', 'User Management'),
      icon: 'user-cog',
      color: '#4A90E2',
    },
    {
      id: '2',
      title: t('dashboard.admin.systemSettings', 'System Settings'),
      icon: 'cog',
      color: '#FF6B6B',
    },
    {
      id: '3',
      title: t('dashboard.admin.reports', 'Reports & Analytics'),
      icon: 'chart-pie',
      color: '#2E8B57',
    },
    {
      id: '4',
      title: t('dashboard.admin.billing', 'Billing'),
      icon: 'credit-card',
      color: '#9C27B0',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      activity: 'New doctor registration',
      time: '10 minutes ago',
      icon: 'user-plus',
      color: '#4A90E2',
    },
    {
      id: '2',
      activity: 'System backup completed',
      time: '1 hour ago',
      icon: 'save',
      color: '#2E8B57',
    },
    {
      id: '3',
      activity: 'Payment processed',
      time: '2 hours ago',
      icon: 'credit-card',
      color: '#9C27B0',
    },
    {
      id: '4',
      activity: 'Server maintenance',
      time: '3 hours ago',
      icon: 'server',
      color: '#FF9800',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeader
        title={t('dashboard.admin.title', 'Admin Dashboard')}
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
              {t('dashboard.admin.welcome', 'Welcome, Admin')}
            </Text>
            <Text style={styles.userName}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            <FontAwesome5 name="user-shield" size={60} color={colors.primary} />
          </View>
        </View>

        {/* System Stats */}
        <View style={styles.statsGrid}>
          {systemStats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <FontAwesome name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={styles.statChange}>({stat.change})</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.admin.quickActions', 'Quick Actions')}
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

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('dashboard.admin.recentActivities', 'Recent Activities')}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>
                {t('dashboard.admin.seeAll', 'See All')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
                <FontAwesome name={activity.icon as any} size={16} color={activity.color} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>{activity.activity}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.admin.systemStatus', 'System Status')}
          </Text>
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>
                {t('dashboard.admin.server', 'Server')} - Operational
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>
                {t('dashboard.admin.database', 'Database')} - Online
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: colors.warning }]} />
              <Text style={styles.statusText}>
                {t('dashboard.admin.backup', 'Backup')} - In Progress
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>
                {t('dashboard.admin.api', 'API Services')} - Running
              </Text>
            </View>
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
  },
  avatarContainer: {
    marginLeft: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChange: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statTitle: {
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
  activityCard: {
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
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 16,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
  },
});

export default AdminDashboard;