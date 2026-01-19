import DashboardShell from './DashboardShell'

export default function AmbulanceDashboard() {
  return (
    <DashboardShell
      title="Ambulance Dashboard"
      requiredRole={["ambulance_staff", "ambulance"]}
      dashboardPath="/ambulance/dashboard"
    />
  )
}
