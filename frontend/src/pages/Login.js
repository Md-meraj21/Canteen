import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, TextField } from '@mui/material';
import { authAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { panel } from '../utils/ui';

function Login() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const completeLogin = (user, token) => {
    setUser(user);
    setToken(token);
    navigate(user?.role === 'admin' ? '/admin' : '/');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginId = formData.identifier.trim();
      const response = await authAPI.login({
        identifier: loginId,
        email: loginId,
        username: loginId,
        password: formData.password,
      });
      completeLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[70vh] place-items-center px-2 py-4 sm:px-4 sm:py-10">
      <section className={`${panel} w-full max-w-md p-5 sm:p-6`}>
        <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Login</h1>
        <p className="mt-2 text-sm text-slate-500">Access your account, orders, and saved products.</p>

        {error && <Alert severity="error" className="!mt-5">{error}</Alert>}

        <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:mt-6 sm:gap-4">
          <TextField
            label="Username or Email"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="success" size="large" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link to="/forgot-password" className="font-bold text-emerald-700 hover:text-emerald-800">
            Forgot password?
          </Link>
        </p>

        <p className="mt-5 text-center text-sm text-slate-600">
          Do not have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800">
            Register
          </Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
