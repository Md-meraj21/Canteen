import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, MenuItem, TextField } from '@mui/material';
import { authAPI, getApiErrorMessage } from '../services/api';
import { useAuthStore } from '../context/store';
import { panel } from '../utils/ui';

const ranks = [
  'Subedar Major',
  'Subedar',
  'Naib Subedar',
  'Havildar Major',
  'Havildar',
  'Naib Havildar',
  'Lance Naik',
  'Sepoy',
  'Officer',
  'Jawan',
];

function AuthSwitch({ children, to, onSwitchMode, onNavigateAway }) {
  if (onSwitchMode) {
    return (
      <button
        type="button"
        className="border-0 bg-transparent p-0 font-bold text-emerald-700 hover:text-emerald-800"
        onClick={onSwitchMode}
      >
        {children}
      </button>
    );
  }

  return (
    <Link to={to} onClick={onNavigateAway} className="font-bold text-emerald-700 hover:text-emerald-800">
      {children}
    </Link>
  );
}

export function LoginForm({ variant = 'page', onSuccess, onSwitchMode, onForgotPassword, onNavigateAway }) {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isModal = variant === 'modal';

  const completeLogin = (user, token) => {
    setUser(user);
    setToken(token);
    onSuccess?.();
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
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={isModal ? 'w-full' : `${panel} w-full max-w-md p-5 sm:p-6`}>
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
        {onForgotPassword ? (
          <button
            type="button"
            onClick={onForgotPassword}
            className="border-0 bg-transparent p-0 font-bold text-emerald-700 hover:text-emerald-800"
          >
            Forgot password?
          </button>
        ) : (
          <Link
            to="/forgot-password"
            onClick={onNavigateAway}
            className="font-bold text-emerald-700 hover:text-emerald-800"
          >
            Forgot password?
          </Link>
        )}
      </p>

      <p className="mt-5 text-center text-sm text-slate-600">
        Do not have an account?{' '}
        <AuthSwitch to="/register" onSwitchMode={onSwitchMode} onNavigateAway={onNavigateAway}>
          Register
        </AuthSwitch>
      </p>
    </section>
  );
}

export function RegisterForm({ variant = 'page', onSwitchMode, onVerificationPending, onNavigateAway }) {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    militaryId: '',
    rank: '',
  });
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const isModal = variant === 'modal';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = img.width > 800 ? 800 / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setIdCardPreview(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.register({
        ...formData,
        idCardImage: idCardPreview || null,
      });
      setOtpSent(true);
      setVerifiedEmail(response.data.email || formData.email);
      setMessage(response.data.message || 'OTP sent to your email.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const pendingEmail = verifiedEmail || formData.email;
      const response = await authAPI.verifyRegistrationOtp({
        email: pendingEmail,
        otp,
      });
      const { user, token, nextPath } = response.data || {};

      if (user && token) {
        localStorage.removeItem('pendingRegistrationEmail');
        setUser(user);
        setToken(token);
        onNavigateAway?.();
        navigate(user.role === 'admin' ? '/admin' : '/');
        return;
      }

      localStorage.setItem('pendingRegistrationEmail', pendingEmail);
      if (onVerificationPending) {
        onVerificationPending(pendingEmail, nextPath || '/verification-pending');
      } else {
        onNavigateAway?.();
        navigate(nextPath || '/verification-pending', { state: { email: pendingEmail } });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'OTP verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setResending(true);

    try {
      const response = await authAPI.resendRegistrationOtp(verifiedEmail || formData.email);
      setMessage(response.data.message || 'OTP sent again.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not resend OTP'));
    } finally {
      setResending(false);
    }
  };

  return (
    <section className={isModal ? 'w-full' : `${panel} p-4 sm:p-8`}>
      <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Defence personnel</p>
      <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Military Registration</h1>
      <p className="mt-2 text-sm text-slate-500">Your account will be reviewed before shopping access is enabled.</p>

      {error && <Alert severity="error" className="!mt-5">{error}</Alert>}
      {message && <Alert severity="success" className="!mt-5">{message}</Alert>}

      {!otpSent ? (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
          <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} required fullWidth />
          <TextField
            label="Unique Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            inputProps={{ minLength: 3, pattern: '[A-Za-z0-9_]+' }}
            helperText="Letters, numbers, and underscores only"
            required
            fullWidth
          />
          <TextField label="Email" name="email" value={formData.email} onChange={handleChange} required fullWidth />
          <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required fullWidth />
          <TextField label="Military ID" name="militaryId" value={formData.militaryId} onChange={handleChange} required fullWidth />
          <TextField select label="Rank" name="rank" value={formData.rank} onChange={handleChange} required fullWidth>
            {ranks.map((rank) => (
              <MenuItem key={rank} value={rank}>{rank}</MenuItem>
            ))}
          </TextField>
          <TextField
            className="sm:col-span-2"
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            inputProps={{ minLength: 6 }}
            required
            fullWidth
          />

          <div className="sm:col-span-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <label className="block text-sm font-bold text-slate-700">ID Card Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required className="mt-3 text-sm" />
            {idCardPreview && (
              <img src={idCardPreview} alt="ID Card Preview" className="mt-4 max-h-64 rounded-md border border-slate-200 object-contain" />
            )}
          </div>

          <Alert severity="warning" className="sm:col-span-2">
            Your email will be verified by OTP first, then your ID card will be sent to the administrator.
          </Alert>

          <Button type="submit" variant="contained" color="success" size="large" disabled={loading} className="sm:col-span-2">
            {loading ? 'Sending OTP...' : 'Send Email OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-6 grid gap-4">
          <Alert severity="info">
            OTP sent to {verifiedEmail || formData.email}. Verify it to submit your registration for admin approval.
          </Alert>
          <TextField
            label="Email OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="success" size="large" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify OTP and Submit'}
          </Button>
          <Button type="button" variant="outlined" color="success" disabled={resending} onClick={handleResendOtp}>
            {resending ? 'Sending...' : 'Resend OTP'}
          </Button>
          <Button type="button" color="inherit" onClick={() => setOtpSent(false)}>
            Edit registration details
          </Button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <AuthSwitch to="/login" onSwitchMode={onSwitchMode} onNavigateAway={onNavigateAway}>
          Login
        </AuthSwitch>
      </p>
    </section>
  );
}
