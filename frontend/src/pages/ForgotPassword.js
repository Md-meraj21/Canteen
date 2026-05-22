import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, TextField } from '@mui/material';
import { authAPI } from '../services/api';
import { panel } from '../utils/ui';

function ForgotPassword() {
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
      setError(err.response?.data?.error || 'Could not send password reset OTP');
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
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-10">
      <section className={`${panel} w-full max-w-md p-6`}>
        <h1 className="text-3xl font-black text-slate-950">Reset password</h1>
        <p className="mt-2 text-sm text-slate-500">We will send an OTP to your registered email.</p>

        {error && <Alert severity="error" className="!mt-5">{error}</Alert>}
        {message && <Alert severity="success" className="!mt-5">{message}</Alert>}

        {!otpSent ? (
          <form onSubmit={requestOtp} className="mt-6 grid gap-4">
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
          <form onSubmit={resetPassword} className="mt-6 grid gap-4">
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
          Remember password?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">
            Login
          </Link>
        </p>
      </section>
    </div>
  );
}

export default ForgotPassword;
