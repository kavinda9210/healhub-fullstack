import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types/navigation';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import IntroScreen from '../screens/IntroScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';

// Dashboard screens (we'll create these in Step 3)
import PatientDashboardScreen from '../screens/dashboards/PatientDashboard';
import DoctorDashboardScreen from '../screens/dashboards/DoctorDashboard';
import AdminDashboardScreen from '../screens/dashboards/AdminDashboard';
import AmbulanceDashboardScreen from '../screens/dashboards/AmbulanceDashboard';

// Create navigators
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tabs based on role
const PatientTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="PatientDashboard" component={PatientDashboardScreen} />
    {/* Add other patient tabs here */}
  </Tab.Navigator>
);

const DoctorTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="DoctorDashboard" component={DoctorDashboardScreen} />
    {/* Add other doctor tabs here */}
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    {/* Add other admin tabs here */}
  </Tab.Navigator>
);

const AmbulanceTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="AmbulanceDashboard" component={AmbulanceDashboardScreen} />
    {/* Add other ambulance tabs here */}
  </Tab.Navigator>
);

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
  </AuthStack.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const { user, isLoading, dashboardInfo } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  const getRoleBasedNavigator = () => {
    if (!user) {
      return <AuthNavigator />;
    }

    switch (user.role) {
      case 'patient':
        return <PatientTabs />;
      case 'doctor':
        return <DoctorTabs />;
      case 'admin':
        return <AdminTabs />;
      case 'ambulance_staff':
        return <AmbulanceTabs />;
      default:
        return <PatientTabs />;
    }
  };

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <RootStack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
          <RootStack.Screen name="Intro" component={IntroScreen} />
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        </>
      ) : (
        <RootStack.Screen name="Main">
          {() => getRoleBasedNavigator()}
        </RootStack.Screen>
      )}
    </RootStack.Navigator>
  );
};

// Main Navigation Container
const Navigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation;