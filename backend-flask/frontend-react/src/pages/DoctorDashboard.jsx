import DashboardShell from './DashboardShell'
import DoctorAvailability from '../components/DoctorAvailability'

export default function DoctorDashboard() {
  return (
    <DashboardShell title="Doctor Dashboard" requiredRole="doctor" dashboardPath="/doctor/dashboard">
      <DoctorAvailability />
    </DashboardShell>
  )
}
