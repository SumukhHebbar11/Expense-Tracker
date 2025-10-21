import { useState, useRef, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import '../styles/forms.css'

import { authAPI } from '../utils/api'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const ResetPassword = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useRef(null)
  const { token } = useParams()
  const navigate = useNavigate()

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const showSuccessToast = useCallback((message) => {
    if (toast.current) {
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: message,
        life: 3000
      })
    }
  }, [])

  const showErrorToast = useCallback((message) => {
    if (toast.current) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000
      })
    }
  }, [])

  const onSubmit = useCallback(async (data) => {
    try {
      setError('')
      setLoading(true)
      await authAPI.resetPassword(token, data.password)
      setSuccess(true)
      showSuccessToast('Password reset successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reset password. The link may have expired.'
      setError(errorMessage)
      showErrorToast(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [token, navigate, showSuccessToast, showErrorToast])

  return (
    <>
      <Toast ref={toast} position="top-right" />
      
      <div className="auth-background">
        <div className="form-container">
          <Card className="form-card">
            <div className="p-6">
              <div className="form-header">
                <h2 className="form-title">
                  Create New Password
                </h2>
                <p className="form-subtitle">
                  Enter your new password below
                </p>
              </div>
            
              {success ? (
                <div className="space-y-6">
                  <div className="form-message">
                    <Message 
                      severity="success" 
                      text="Your password has been reset successfully! Redirecting to login..." 
                      className="w-full" 
                    />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="form-message">
                      <Message severity="error" text={error} className="w-full" />
                    </div>
                  )}
                  
                  <div className="space-y-5">
                    <div className="form-field">
                      <label htmlFor="password" className="form-label">
                        New Password
                      </label>
                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <div className="form-input">
                            <Password
                              {...field}
                              id="password"
                              placeholder="Enter new password"
                              toggleMask
                              feedback={true}
                              className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                              inputClassName="w-full"
                              disabled={loading}
                            />
                          </div>
                        )}
                      />
                      {errors.password && (
                        <small className="form-error">{errors.password.message}</small>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password
                      </label>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                          <div className="form-input">
                            <Password
                              {...field}
                              id="confirmPassword"
                              placeholder="Confirm new password"
                              toggleMask
                              feedback={false}
                              className={`w-full ${errors.confirmPassword ? 'p-invalid' : ''}`}
                              inputClassName="w-full"
                              disabled={loading}
                            />
                          </div>
                        )}
                      />
                      {errors.confirmPassword && (
                        <small className="form-error">{errors.confirmPassword.message}</small>
                      )}
                    </div>
                  </div>

                  <div className="form-actions form-actions-single">
                    <Button
                      type="submit"
                      disabled={loading}
                      loading={loading}
                      label={loading ? 'Resetting...' : 'Reset Password'}
                      className="form-button"
                    />
                  </div>
                
                  <div className="form-footer">
                    <p className="form-footer-text">
                      Remember your password?{' '}
                      <Link to="/login" className="form-footer-link">
                        Back to login
                      </Link>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default ResetPassword
