import React from 'react'
import {useAuth} from '../hooks/useAuth'

const Login = ({mode='register'}) => {

  const isRegisterMode = mode === 'register';
  const { isAuthLoading, isAuthenticated } = useAuth();

  if (isAuthLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
        <div>
            isRegisterMode ? 'Register' : 'Login'
        </div>
    </div>
  )
}

export default Login