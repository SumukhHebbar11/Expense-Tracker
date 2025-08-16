import { useState, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import '../styles/forms.css'

import { useAuth } from '../context/AuthContext'

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const Register = () => {
  const [error, setError] = useState('')
  const toast = useRef(null)
  const { register: registerUser, loading } = useAuth()
  
  const formConfig = useMemo(() => ({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  }), [])

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm(formConfig)

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
        summary: 'Registration Failed',
        detail: message,
        life: 5000
      })
    }
  }, [])

  const onSubmit = useCallback(async (data) => {
    try {
      setError('')
      const { confirmPassword, ...registerData } = data
      await registerUser(registerData)
      showSuccessToast('Account created successfully! Welcome to Expense Tracker.')
    } catch (err) {
      const errorMessage = err.message || 'Unable to create account. Please try again.'
      setError(errorMessage)
      showErrorToast(errorMessage)
    }
  }, [registerUser, showSuccessToast, showErrorToast])

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <div className="auth-background">
        <div className="form-container">
          <Card className="form-card">
            <div className="p-6">
              <div className="form-header">
                <h2 className="form-title">
                  Create your account
                </h2>
                <p className="form-subtitle">
                  Join Expense Tracker and start managing your finances
                </p>
              </div>
            
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="form-message">
                    <Message severity="error" text={error} className="w-full" />
                  </div>
                )}
              
                <div className="space-y-5">
                  <div className="form-field">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <Controller
                      name="username"
                      control={control}
                      render={({ field }) => (
                        <div className="form-input">
                          <InputText
                            {...field}
                            id="username"
                            placeholder="Enter your username"
                            autoComplete="username"
                            className={`w-full ${errors.username ? 'p-invalid' : ''}`}
                          />
                        </div>
                      )}
                    />
                    {errors.username && (
                      <small className="form-error">{errors.username.message}</small>
                    )}
                  </div>

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
                            autoComplete="email"
                            className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                          />
                        </div>
                      )}
                    />
                    {errors.email && (
                      <small className="form-error">{errors.email.message}</small>
                    )}
                  </div>
                
                  <div className="form-field">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <div className="form-input">
                          <Password
                            {...field}
                            id="password"
                            placeholder="Enter your password"
                            toggleMask
                            feedback={false}
                            autoComplete="new-password"
                            className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                            inputClassName="w-full"
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
                      Confirm Password
                    </label>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <div className="form-input">
                          <Password
                            {...field}
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            toggleMask
                            feedback={false}
                            autoComplete="new-password"
                            className={`w-full ${errors.confirmPassword ? 'p-invalid' : ''}`}
                            inputClassName="w-full"
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
                    label={loading ? 'Creating account...' : 'Create account'}
                    className="form-button"
                  />
                </div>
              
                <div className="form-footer">
                  <p className="form-footer-text">
                    Already have an account?{' '}
                    <Link to="/login" className="form-footer-link">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
  
}

export default Register
