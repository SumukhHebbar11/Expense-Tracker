import { useState, useEffect } from 'react'
import { useFamilyMembers, useAddFamilyMember, useUpdateFamilyMember, useDeleteFamilyMember } from '../hooks/useFamilyMembers'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'

const Settings = () => {
  const { data: members = [], isLoading } = useFamilyMembers()
  const add = useAddFamilyMember()
  const update = useUpdateFamilyMember()
  const remove = useDeleteFamilyMember()
  const { user, updateProfile } = useAuth()
  const notifications = useNotifications()

  const [usernameInput, setUsernameInput] = useState(user?.username || '')
  const [emailInput, setEmailInput] = useState(user?.email || '')
  const [passwordInput, setPasswordInput] = useState('')
  const [currentPasswordInput, setCurrentPasswordInput] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setUsernameInput(user?.username || '')
    setEmailInput(user?.email || '')
  }, [user])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const [editing, setEditing] = useState(null)
  const [nameInput, setNameInput] = useState('')

  const handleAdd = async () => {
    if (!nameInput.trim()) return
    try {
      await add.mutateAsync({ name: nameInput.trim() })
      setNameInput('')
    } catch (err) {}
  }

  const handleUpdate = async (id) => {
    if (!nameInput.trim()) return
    try {
      await update.mutateAsync({ id, name: nameInput.trim() })
      setEditing(null)
      setNameInput('')
    } catch (err) {}
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return
    try {
      await remove.mutateAsync(id)
    } catch (err) {}
  }

  const handleReset = () => {
    if (!window.confirm('Reset profile changes? This will restore username and email to their saved values.')) return
    setUsernameInput(user?.username || '')
    setEmailInput(user?.email || '')
    setPasswordInput('')
    setCurrentPasswordInput('')
    setToast({ type: 'info', text: 'Changes reverted' })
  }

  const handleProfileSave = async () => {
    setProfileLoading(true)
    try {

      const payload = { username: usernameInput, email: emailInput, currentPassword: currentPasswordInput }
      if (passwordInput) payload.password = passwordInput
      await updateProfile(payload)
      setPasswordInput('')
      setCurrentPasswordInput('')
      setToast({ type: 'success', text: 'Profile updated' })
    } catch (err) {
      setToast({ type: 'error', text: err?.message || 'Update failed' })
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage family members</p>
        </div>
      </div>
         {toast && (
          <div className={`p-3 mb-4 rounded flex items-start justify-between ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            <div>{toast.text}</div>
            <button onClick={() => setToast(null)} aria-label="dismiss" className="ml-4 font-bold">×</button>
          </div>
        )}


      {/* Manage your account card */}
      <div className="card p-4">
        <h3 className="font-semibold mb-3">Manage your account</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1">
            <label className="label">Username</label>
            <input value={usernameInput} onChange={(e) => { setUsernameInput(e.target.value); setToast(null) }} className="input" />
          </div>
          <div className="col-span-1">
            <label className="label">Email</label>
            <input value={emailInput} onChange={(e) => { setEmailInput(e.target.value); setToast(null) }} className="input" />
          </div>
          <div className="col-span-1 flex flex-col justify-end items-end space-y-2">
           
            <button onClick={() => setShowPasswordModal(true)} className="form-button-secondary btn-small">Change password</button>
          </div>
        </div>

        {/* Password modal inside account section */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">Current Password</label>
                  <input value={currentPasswordInput} onChange={(e) => setCurrentPasswordInput(e.target.value)} type="password" className="input" />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} type="password" className="input" />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => { setShowPasswordModal(false); setPasswordInput(''); setCurrentPasswordInput('') }} className="form-button-secondary btn-small">Cancel</button>
                <button onClick={async () => { setShowPasswordModal(false); await handleProfileSave(); }} className="form-button btn-small">Save</button>
              </div>
            </div>
          </div>
        )}

     
        {/* Save only at bottom of the account card */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-4">
             <button onClick={handleReset} className="form-button-secondary btn-small">Reset</button>
          <button onClick={handleProfileSave} disabled={profileLoading} className="form-button btn-inline">{profileLoading ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </div>

      {/* Push Notifications card */}
      <div className="card p-4">
        <h3 className="font-semibold mb-3 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
            <path d="M5.85 3.5a.75.75 0 00-1.117-1 9.719 9.719 0 00-2.348 4.876.75.75 0 001.479.248A8.219 8.219 0 015.85 3.5zM19.267 2.5a.75.75 0 10-1.118 1 8.22 8.22 0 011.987 4.124.75.75 0 001.48-.248A9.72 9.72 0 0019.266 2.5z" />
            <path fillRule="evenodd" d="M12 2.25A6.75 6.75 0 005.25 9v.75a8.217 8.217 0 01-2.119 5.52.75.75 0 00.298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 107.48 0 24.583 24.583 0 004.83-1.244.75.75 0 00.298-1.205 8.217 8.217 0 01-2.118-5.52V9A6.75 6.75 0 0012 2.25zM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 004.496 0l.002.1a2.25 2.25 0 11-4.5 0z" clipRule="evenodd" />
          </svg>
          <span>Push Notifications</span>
        </h3>

        {!notifications.isSupported ? (
          <div className="text-sm text-gray-600">
            Push notifications are not supported in your browser. Please use a modern browser like Chrome, Firefox, or Edge.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Get daily reminders and updates delivered straight to your device.
            </p>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${notifications.isSubscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div>
                  <div className="text-sm font-medium">
                    {notifications.isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {notifications.isSubscribed 
                      ? 'You will receive daily reminders at 9:00 AM'
                      : notifications.permission === 'denied'
                      ? 'Permission denied. Enable in browser settings.'
                      : 'Click subscribe to enable notifications'}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {notifications.isSubscribed ? (
                  <>
                    <button
                      onClick={async () => {
                        const result = await notifications.sendTestNotification();
                        if (result.success) {
                          setToast({ type: 'success', text: `Test notification sent via ${result.method}!` });
                        } else {
                          setToast({ type: 'error', text: result.error || 'Failed to send test' });
                        }
                      }}
                      disabled={notifications.loading}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                      {notifications.loading ? 'Sending...' : 'Test'}
                    </button>
                    <button
                      onClick={async () => {
                        const result = await notifications.unsubscribe();
                        if (result.success) {
                          setToast({ type: 'success', text: 'Notifications disabled' });
                        } else {
                          setToast({ type: 'error', text: result.error || 'Failed to unsubscribe' });
                        }
                      }}
                      disabled={notifications.loading}
                      className="form-button-secondary btn-small"
                    >
                      {notifications.loading ? 'Processing...' : 'Disable'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={async () => {
                      const result = await notifications.subscribe();
                      if (result.success) {
                        setToast({ type: 'success', text: 'Notifications enabled!' });
                      } else {
                        if (result.error === 'permission_denied') {
                          setToast({ type: 'error', text: 'Permission denied. Check browser settings.' });
                        } else {
                          setToast({ type: 'error', text: result.error || 'Failed to subscribe' });
                        }
                      }
                    }}
                    disabled={notifications.loading || notifications.permission === 'denied'}
                    className="form-button btn-small"
                  >
                    {notifications.loading ? 'Subscribing...' : 'Enable Notifications'}
                  </button>
                )}
              </div>
            </div>

            {notifications.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {notifications.error}
              </div>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>📱 <strong>Daily Reminders:</strong> Receive notifications at 9:00 AM every day</p>
              <p>📧 <strong>Email Fallback:</strong> If push notifications fail, you'll receive emails instead</p>
              <p>🔒 <strong>Privacy:</strong> We only send scheduled reminders and important updates</p>
            </div>
          </div>
        )}
      </div>

      {/* Family members card */}
      <div className="card p-4">
        <h3 className="font-semibold mb-3">Manage family members</h3>
        <div className="space-y-3">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            members.map(m => (
              <div key={m._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">{m.name}</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => { setEditing(m._id); setNameInput(m.name) }} className="text-blue-600 btn-small">Edit</button>
                  <button onClick={() => handleDelete(m._id)} className="text-red-600 btn-small">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Member name" className="input flex-1 max-w-xs" />

            {editing ? (
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button onClick={() => handleUpdate(editing)} className="form-button btn-small">Save</button>
                <button onClick={() => { setEditing(null); setNameInput('') }} className="form-button-secondary btn-small">Cancel</button>
              </div>
            ) : (
              <button onClick={handleAdd} aria-label="Add member" className="form-button btn-small rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12 5a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H6a1 1 0 110-2h5V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
