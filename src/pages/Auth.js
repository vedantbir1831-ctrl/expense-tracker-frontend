import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock, User, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Successfully logged in!');
      } else {
        await register(name, email, password);
        toast.success('Registration successful!');
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Wallet style={{ color: 'white', width: '28px', height: '28px' }} />
          </div>
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Sign in to track your college expenses' 
              : 'Start managing your student budget today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="stagger">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-icon">
                <User />
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-icon">
              <Mail />
              <input
                type="email"
                className="form-input"
                placeholder="you@student.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-icon">
              <Lock />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
            ) : isLogin ? (
              <>
                <LogIn /> Sign In
              </>
            ) : (
              <>
                <UserPlus /> Sign Up
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              New here?{' '}
              <span className="auth-link" onClick={() => setIsLogin(false)}>
                Create an account
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span className="auth-link" onClick={() => setIsLogin(true)}>
                Sign in instead
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
