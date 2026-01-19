import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, clearAuth } from '../lib/storage'
import './AdminDashboard.css'

const API_BASE = '/api/admin'
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const MIN_USER_AGE = Number(import.meta.env.VITE_MIN_USER_AGE || 13)

function maxDobISO(minAgeYears) {
  const today = new Date()
  const d = new Date(today.getFullYear() - minAgeYears, today.getMonth(), today.getDate())
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'patient',
  dateOfBirth: '',
  // Doctor fields
  departmentId: '',
  hospitalName: '',
  licenseNumber: '',
  availableFrom: '',
  availableTo: '',
  availableDate: '',
  slotDurationMinutes: 30,
  doctorAvailableDays: [],
  // Ambulance fields
  staffType: '',
  vehicleRegistration: '',
  assignedCity: '',
  assignedState: '',
  shiftType: '',
  ambulanceAvailableDays: [],
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const token = getToken()
  const [users, setUsers] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [filterRole, setFilterRole] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Form states
  const [formData, setFormData] = useState(initialFormData)
  const [departments, setDepartments] = useState([])
  const [editingUserId, setEditingUserId] = useState(null)
  const [editingLoading, setEditingLoading] = useState(false)

  // Fetch users and counts on mount
  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchData()
  }, [token, filterRole])

  const fetchData = async () => {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch user counts
      const countsRes = await fetch(`${API_BASE}/user-counts`, { headers })
      if (countsRes.ok) {
        const countsData = await countsRes.json()
        setCounts(countsData.data || {})
      }

      // Fetch users
      const userUrl = filterRole ? `${API_BASE}/users?role=${filterRole}` : `${API_BASE}/users`
      const usersRes = await fetch(userUrl, { headers })
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.data || [])
      }

      setError('')
    } catch (err) {
      setError('Failed to load data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load departments when adding a doctor
  useEffect(() => {
    async function loadDepartments() {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const res = await fetch(`/api/admin/departments`, { headers })
        if (res.ok) {
          const data = await res.json()
          setDepartments(Array.isArray(data.data) ? data.data : [])
        }
      } catch {}
    }
    if (showAddModal && formData.role === 'doctor') {
      loadDepartments()
    }
  }, [showAddModal, formData.role, token])

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth,
      }

      if (formData.role === 'doctor') {
        payload.doctor = {
          departmentId: formData.departmentId || undefined,
          hospitalName: formData.hospitalName || undefined,
          licenseNumber: formData.licenseNumber || undefined,
          availableFrom: formData.availableFrom || undefined,
          availableTo: formData.availableTo || undefined,
          availableDate: formData.availableDate || undefined,
          slotDurationMinutes: formData.slotDurationMinutes,
          availableDays: formData.doctorAvailableDays,
        }
      }
      if (formData.role === 'ambulance_staff') {
        payload.ambulance = {
          staffType: formData.staffType || undefined,
          vehicleRegistration: formData.vehicleRegistration || undefined,
          assignedCity: formData.assignedCity || undefined,
          assignedState: formData.assignedState || undefined,
          shiftType: formData.shiftType || undefined,
          availableDays: formData.ambulanceAvailableDays,
        }
      }

      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowAddModal(false)
        resetForm()
        fetchData()
      } else {
        const errData = await res.json()
        setError(errData.message || 'Failed to add user')
      }
    } catch (err) {
      setError('Error adding user: ' + err.message)
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth,
      }

      if (formData.role === 'doctor') {
        payload.doctor = {
          departmentId: formData.departmentId || undefined,
          hospitalName: formData.hospitalName || undefined,
          licenseNumber: formData.licenseNumber || undefined,
          availableFrom: formData.availableFrom || undefined,
          availableTo: formData.availableTo || undefined,
          availableDate: formData.availableDate || undefined,
          slotDurationMinutes: formData.slotDurationMinutes,
          availableDays: formData.doctorAvailableDays,
        }
      }
      if (formData.role === 'ambulance_staff') {
        payload.ambulance = {
          staffType: formData.staffType || undefined,
          vehicleRegistration: formData.vehicleRegistration || undefined,
          assignedCity: formData.assignedCity || undefined,
          assignedState: formData.assignedState || undefined,
          shiftType: formData.shiftType || undefined,
          availableDays: formData.ambulanceAvailableDays,
        }
      }

      const res = await fetch(`${API_BASE}/users/${editingUserId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowEditModal(false)
        resetForm()
        fetchData()
      } else {
        const errData = await res.json()
        setError(errData.message || 'Failed to update user')
      }
    } catch (err) {
      setError('Error updating user: ' + err.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` }

      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers,
      })

      if (res.ok) {
        setShowDeleteConfirm(null)
        fetchData()
      } else {
        setError('Failed to delete user')
      }
    } catch (err) {
      setError('Error deleting user: ' + err.message)
    }
  }

  const openEditModal = async (user) => {
    try {
      setEditingLoading(true)
      setEditingUserId(user.id)

      const headers = { Authorization: `Bearer ${token}` }
      const res = await fetch(`${API_BASE}/users/${user.id}`, { headers })
      const data = res.ok ? await res.json() : null
      const u = data?.data || user

      const uiRole = (u.role === 'ambulance' ? 'ambulance_staff' : u.role) || 'patient'

      // Load departments when editing a doctor
      if (uiRole === 'doctor') {
        try {
          const depRes = await fetch(`/api/admin/departments`, { headers })
          if (depRes.ok) {
            const depData = await depRes.json()
            setDepartments(Array.isArray(depData.data) ? depData.data : [])
          }
        } catch {}
      }

      setFormData({
        ...initialFormData,
        firstName: u.first_name || u.firstName || '',
        lastName: u.last_name || u.lastName || '',
        email: u.email || '',
        phone: u.phone || '',
        password: '',
        role: uiRole,
        dateOfBirth: (u.date_of_birth || u.dateOfBirth || '').slice(0, 10),

        // doctor
        departmentId: u.doctor?.departmentId || '',
        hospitalName: u.doctor?.hospitalName || '',
        licenseNumber: u.doctor?.licenseNumber || '',
        availableFrom: (u.doctor?.availableFrom || '').slice(0, 5),
        availableTo: (u.doctor?.availableTo || '').slice(0, 5),
        availableDate: (u.doctor?.availableDate || '').slice(0, 10),
        slotDurationMinutes: u.doctor?.slotDurationMinutes ?? 30,
        doctorAvailableDays: Array.isArray(u.doctor?.availableDays) ? u.doctor.availableDays : [],

        // ambulance
        staffType: u.ambulance?.staffType || '',
        vehicleRegistration: u.ambulance?.vehicleRegistration || '',
        assignedCity: u.ambulance?.assignedCity || '',
        assignedState: u.ambulance?.assignedState || '',
        shiftType: u.ambulance?.shiftType || '',
        ambulanceAvailableDays: Array.isArray(u.ambulance?.availableDays) ? u.ambulance.availableDays : [],
      })

      setShowEditModal(true)
    } catch (e) {
      setError('Failed to load user profile: ' + (e?.message || String(e)))
    } finally {
      setEditingLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingUserId(null)
  }

  const toggleDay = (key, day) => {
    const current = Array.isArray(formData[key]) ? formData[key] : []
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    setFormData({ ...formData, [key]: next })
  }

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query)
    )
  })

  if (loading) {
    return <div className="admin-container"><p>Loading...</p></div>
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => navigate('/profile')}>Profile</button>
          <button className="logout-btn" onClick={() => { clearAuth(); navigate('/login') }}>Logout</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* User Counts Cards */}
      <div className="stats-grid">
        {Array.isArray(counts) && counts.length > 0 ? (
          counts.map((stat) => (
            <div key={stat.role} className="stat-card">
              <h3>{stat.role}</h3>
              <p className="stat-count">{stat.count || 0}</p>
            </div>
          ))
        ) : (
          <div className="stat-card">
            <p>No users yet</p>
          </div>
        )}
      </div>

      {/* User Management Section */}
      <div className="user-management">
        <div className="user-actions">
          <button className="btn-primary" onClick={() => { resetForm(); setShowAddModal(true) }}>
            Add User
          </button>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="filter-select">
            <option value="">All Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
            <option value="ambulance_staff">Ambulance Staff</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <span className={`role-badge role-${user.role === 'ambulance' ? 'ambulance_staff' : user.role}`}>
                        {user.role === 'ambulance' ? 'ambulance_staff' : user.role}
                      </span>
                    </td>
                    <td>
                      <button className="btn-sm btn-edit" onClick={() => openEditModal(user)}>Edit</button>
                      <button className="btn-sm btn-delete" onClick={() => setShowDeleteConfirm(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="field">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  max={maxDobISO(MIN_USER_AGE)}
                  required
                />
              </div>

              <div className="field">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label className="form-label">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                  <option value="ambulance_staff">Ambulance Staff</option>
                </select>
              </div>

              {formData.role === 'doctor' && (
                <div className="role-extra">
                  <label className="form-label">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.length === 0 ? (
                      <option value="" disabled>No departments available</option>
                    ) : (
                      departments.map((d) => {
                        const id = d?.id ?? d?.department_id
                        const name = d?.name ?? d?.department_name ?? d?.department
                        return (
                          <option key={id || name} value={id || ''}>
                            {name || id}
                          </option>
                        )
                      })
                    )}
                  </select>

                  <div className="field">
                    <label className="form-label">Hospital Name</label>
                    <input
                      type="text"
                      value={formData.hospitalName}
                      onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="form-label">License Number</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Available From</label>
                      <input
                        type="time"
                        value={formData.availableFrom}
                        onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Available To</label>
                      <input
                        type="time"
                        value={formData.availableTo}
                        onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Available Date</label>
                      <input
                        type="date"
                        value={formData.availableDate}
                        onChange={(e) => setFormData({ ...formData, availableDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Slot Duration (minutes)</label>
                      <input
                        type="number"
                        value={formData.slotDurationMinutes}
                        min={5}
                        onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <label className="form-label">Available Days</label>
                  <div className="row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={formData.doctorAvailableDays.includes(day)}
                          onChange={() => toggleDay('doctorAvailableDays', day)}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.role === 'ambulance_staff' && (
                <div className="role-extra">
                  <label className="form-label">Staff Type</label>
                  <select
                    value={formData.staffType}
                    onChange={(e) => setFormData({ ...formData, staffType: e.target.value })}
                    required
                  >
                    <option value="">Select Staff Type</option>
                    <option value="driver">Driver</option>
                    <option value="paramedic">Paramedic</option>
                    <option value="attendant">Attendant</option>
                    <option value="nurse">Nurse</option>
                  </select>
                  <div className="field">
                    <label className="form-label">Vehicle Registration</label>
                    <input
                      type="text"
                      value={formData.vehicleRegistration}
                      onChange={(e) => setFormData({ ...formData, vehicleRegistration: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Assigned City</label>
                      <input
                        type="text"
                        value={formData.assignedCity}
                        onChange={(e) => setFormData({ ...formData, assignedCity: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Assigned State</label>
                      <input
                        type="text"
                        value={formData.assignedState}
                        onChange={(e) => setFormData({ ...formData, assignedState: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <label className="form-label">Shift Type</label>
                  <select
                    value={formData.shiftType}
                    onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                    required
                  >
                    <option value="">Select Shift</option>
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                    <option value="rotating">Rotating</option>
                  </select>

                  <label className="form-label">Available Days</label>
                  <div className="row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={formData.ambulanceAvailableDays.includes(day)}
                          onChange={() => toggleDay('ambulanceAvailableDays', day)}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add User</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            {editingLoading ? (
              <p>Loading...</p>
            ) : (
            <form onSubmit={handleEditUser}>
              <div className="field">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label className="form-label">Email</label>
                <input type="email" value={formData.email} disabled className="input-disabled" />
              </div>
              <div className="field">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  max={maxDobISO(MIN_USER_AGE)}
                  required
                />
              </div>

              <div className="field">
                <label className="form-label">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                  <option value="ambulance_staff">Ambulance Staff</option>
                </select>
              </div>

              {formData.role === 'doctor' && (
                <div className="role-extra">
                  <label className="form-label">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.length === 0 ? (
                      <option value="" disabled>No departments available</option>
                    ) : (
                      departments.map((d) => {
                        const id = d?.id ?? d?.department_id
                        const name = d?.name ?? d?.department_name ?? d?.department
                        return (
                          <option key={id || name} value={id || ''}>
                            {name || id}
                          </option>
                        )
                      })
                    )}
                  </select>

                  <div className="field">
                    <label className="form-label">Hospital Name</label>
                    <input
                      type="text"
                      value={formData.hospitalName}
                      onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="form-label">License Number</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Available From</label>
                      <input
                        type="time"
                        value={formData.availableFrom}
                        onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Available To</label>
                      <input
                        type="time"
                        value={formData.availableTo}
                        onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Available Date</label>
                      <input
                        type="date"
                        value={formData.availableDate}
                        onChange={(e) => setFormData({ ...formData, availableDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Slot Duration (minutes)</label>
                      <input
                        type="number"
                        value={formData.slotDurationMinutes}
                        min={5}
                        onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <label className="form-label">Available Days</label>
                  <div className="row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={formData.doctorAvailableDays.includes(day)}
                          onChange={() => toggleDay('doctorAvailableDays', day)}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.role === 'ambulance_staff' && (
                <div className="role-extra">
                  <label className="form-label">Staff Type</label>
                  <select
                    value={formData.staffType}
                    onChange={(e) => setFormData({ ...formData, staffType: e.target.value })}
                    required
                  >
                    <option value="">Select Staff Type</option>
                    <option value="driver">Driver</option>
                    <option value="paramedic">Paramedic</option>
                    <option value="attendant">Attendant</option>
                    <option value="nurse">Nurse</option>
                  </select>
                  <div className="field">
                    <label className="form-label">Vehicle Registration</label>
                    <input
                      type="text"
                      value={formData.vehicleRegistration}
                      onChange={(e) => setFormData({ ...formData, vehicleRegistration: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Assigned City</label>
                      <input
                        type="text"
                        value={formData.assignedCity}
                        onChange={(e) => setFormData({ ...formData, assignedCity: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="form-label">Assigned State</label>
                      <input
                        type="text"
                        value={formData.assignedState}
                        onChange={(e) => setFormData({ ...formData, assignedState: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <label className="form-label">Shift Type</label>
                  <select
                    value={formData.shiftType}
                    onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                    required
                  >
                    <option value="">Select Shift</option>
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                    <option value="rotating">Rotating</option>
                  </select>

                  <label className="form-label">Available Days</label>
                  <div className="row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={formData.ambulanceAvailableDays.includes(day)}
                          onChange={() => toggleDay('ambulanceAvailableDays', day)}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Update User</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={() => handleDeleteUser(showDeleteConfirm)}>Delete</button>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
