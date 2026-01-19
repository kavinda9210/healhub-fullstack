import DashboardShell from './DashboardShell'

export default function PatientDashboard() {
  return <DashboardShell title="Patient Dashboard" requiredRole="patient" dashboardPath="/patient/dashboard" />
}
