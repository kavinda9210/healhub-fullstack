import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';


interface DashboardHeaderProps {
  title: string;
  showBack?: boolean | string; // Accept both boolean and string for safety
  showMenu?: boolean | string;
  showNotifications?: boolean | string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  showBack = false,
  showMenu = true,
  showNotifications = true,
  onMenuPress,
  onNotificationPress,
}) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  // Ensure all props are booleans (convert strings to booleans)
  const isShowBack = typeof showBack === 'boolean' ? showBack : showBack === 'true';
  const isShowMenu = typeof showMenu === 'boolean' ? showMenu : showMenu === 'true';
  const isShowNotifications = typeof showNotifications === 'boolean' ? showNotifications : showNotifications === 'true';

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      // Default menu action - could be a drawer or profile
      navigation.navigate('Profile' as never);
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      // Default notification action
      // navigation.navigate('Notifications');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {isShowBack ? (
          <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : isShowMenu ? (
          <TouchableOpacity onPress={handleMenuPress} style={styles.iconButton}>
            <FontAwesome name="bars" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {user && (
          <Text style={styles.subtitle}>
            {t(`dashboard.roles.${user.role}`, { defaultValue: user.role.charAt(0).toUpperCase() + user.role.slice(1) })}
          </Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {isShowNotifications && (
          <TouchableOpacity onPress={handleNotificationPress} style={styles.iconButton}>
            <FontAwesome name="bell" size={20} color={colors.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
          <FontAwesome name="sign-out" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContainer: {
    width: 60,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default DashboardHeader;