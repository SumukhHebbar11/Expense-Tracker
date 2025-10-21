import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import '../styles/forms.css'

import { authAPI } from '../utils/api'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
})

const ForgotPassword = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useRef(null)

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  const showSuccessToast = useCallback((message) => {
    if (toast.current) {
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: message,
        life: 5000
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
      await authAPI.forgotPassword(data.email)
      setSuccess(true)
      showSuccessToast('Password reset link sent to your email!')
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send reset link. Please try again.'
      setError(errorMessage)
      showErrorToast(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [showSuccessToast, showErrorToast])

  return (
    <>
      <Toast ref={toast} position="top-right" />
      
      <div className="auth-background">
        <div className="form-container">
          <Card className="form-card">
            <div className="p-6">
              <div className="form-header">
                <h2 className="form-title">
                  Reset Your Password
                </h2>
                <p className="form-subtitle">
                  Enter your email and we'll send you a link to reset your password
                </p>
              </div>
            
              {success ? (
                <div className="space-y-6">
                  <div className="form-message">
                    <Message 
                      severity="success" 
                      text="Check your email for a password reset link. The link will expire in 10 minutes." 
                      className="w-full" 
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
                      <label htmlFor="email" className="form-label">
                        Email address
                      </label>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <div className="form-input">
                            <InputText
                              {...field}
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                              disabled={loading}
                            />
                          </div>
                        )}
                      />
                      {errors.email && (
                        <small className="form-error">{errors.email.message}</small>
                      )}
                    </div>
                  </div>

                  <div className="form-actions form-actions-single">
                    <Button
                      type="submit"
                      disabled={loading}
                      loading={loading}
                      label={loading ? 'Sending...' : 'Send Reset Link'}
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
                    <p className="form-footer-text mt-2">
                      Don't have an account?{' '}
                      <Link to="/register" className="form-footer-link">
                        Sign up
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

export default ForgotPassword
