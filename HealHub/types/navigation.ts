import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string; token?: string };
  VerifyEmail: { email?: string };
  Intro: undefined;
};

export type MainTabParamList = {
  PatientDashboard: undefined;
  DoctorDashboard: undefined;
  AdminDashboard: undefined;
  AmbulanceDashboard: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Splash: undefined;
  LanguageSelect: undefined;
  Intro: undefined;
};

// Role types
export type UserRole = 'patient' | 'doctor' | 'admin' | 'ambulance_staff';

// Dashboard info type
export interface DashboardInfo {
  dashboardRoute: string;
  dashboardName: string;
  permissions: string[];
  features: string[];
}

// User type
export interface User {
  id: string;
  email?: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
}

// Login response type
export interface LoginResponse {
  user: User;
  token: string;
  dashboard: DashboardInfo;
}

// Navigation prop types
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;