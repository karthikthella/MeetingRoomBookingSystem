import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { LogIn, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/signin', { username, password });
      const { token, role } = response.data;
      login(token, username, role);
      navigate('/');
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Invalid username or password';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="card w-full max-w-md p-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6 text-primary">
            <LogIn size={56} className="drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </div>
          <h1 className="heading-2">Welcome Back</h1>
          <p className="text-muted mt-2">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3.5 rounded-xl mb-6 flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                <UserIcon size={18} />
              </span>
              <input
                id="username"
                className="form-control pl-11"
                type="text"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                <Lock size={18} />
              </span>
              <input
                id="password"
                className="form-control pl-11"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full py-3 mt-2" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="text-center mt-10 text-sm text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:text-primary-hover underline-offset-4 hover:underline">
            Register for free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
