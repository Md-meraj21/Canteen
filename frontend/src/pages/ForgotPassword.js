import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, TextField } from '@mui/material';
import { authAPI, getApiErrorMessage } from '../services/api';

export function ForgotPasswordForm({ variant = 'page', onBackToLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const requestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email.trim());
      setOtpSent(true);
      setMessage(response.data.message);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send password reset OTP'));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email: email.trim(),
        otp,
        password,
      });
      setMessage(response.data.message);
      setTimeout(() => {
        if (onBackToLogin) {
          onBackToLogin();
        } else {
          navigate('/login');
        }
      }, 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Password reset failed'));
    } finally {
      setLoading(false);
    }
  };

  const loginLink = onBackToLogin ? (
    <button
      type="button"
      className="border-0 bg-transparent p-0 font-bold text-emerald-700 hover:text-emerald-800"
      onClick={onBackToLogin}
    >
      Login
    </button>
  ) : (
    <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">
      Login
    </Link>
  );

  return (
    <section className={variant === 'modal' ? 'w-full' : 'auth-flow-card w-full max-w-md p-5 sm:p-6'}>
      <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Reset password</h1>
      <p className="mt-2 text-sm text-slate-500">We will send an OTP to your registered email.</p>

      {error && <Alert severity="error" className="!mt-5">{error}</Alert>}
      {message && <Alert severity="success" className="!mt-5">{message}</Alert>}

      {!otpSent ? (
        <form onSubmit={requestOtp} className="mt-5 grid gap-3 sm:mt-6 sm:gap-4">
          <TextField
            label="Registered Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="success" size="large" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="mt-5 grid gap-3 sm:mt-6 sm:gap-4">
          <TextField
            label="Email OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            required
            fullWidth
          />
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            inputProps={{ minLength: 6 }}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="success" size="large" disabled={loading || otp.length !== 6}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
          <Button type="button" variant="outlined" color="success" disabled={loading} onClick={requestOtp}>
            Resend OTP
          </Button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-slate-600">
        Remember password? {loginLink}
      </p>
    </section>
  );
}

function ForgotPassword() {
  return (
    <div className="auth-flow-page">
      <ForgotPasswordForm />
    </div>
  );
}

export default ForgotPassword;
