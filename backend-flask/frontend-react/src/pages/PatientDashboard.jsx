import DashboardShell from './DashboardShell'
import ImageDetector from '../components/ImageDetector'

export default function PatientDashboard() {
  return (
    <DashboardShell title="Patient Dashboard" requiredRole="patient" dashboardPath="/patient/dashboard">
      <ImageDetector />
    </DashboardShell>
  )
}
