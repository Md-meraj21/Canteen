import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Chip, Step, StepLabel, Stepper } from '@mui/material';

export function VerificationPendingContent({ email, variant = 'page', onLogin, onHome }) {
  const navigate = useNavigate();
  const finalEmail = email || localStorage.getItem('pendingRegistrationEmail');

  const clearPendingAndGo = (path) => {
    localStorage.removeItem('pendingRegistrationEmail');
    if (path === '/login' && onLogin) {
      onLogin();
      return;
    }
    if (path === '/' && onHome) {
      onHome();
      return;
    }
    navigate(path);
  };

  return (
    <section className={variant === 'modal' ? 'w-full' : 'auth-flow-card w-full max-w-3xl p-4 sm:p-8'}>
      <Chip label="Registration Successful" color="success" className="!font-bold" />
      <h1 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">Your account is waiting for admin verification.</h1>
      <p className="mt-2 text-slate-500">Email: <strong>{finalEmail}</strong></p>

      <div className="mt-5 overflow-x-auto sm:mt-8">
        <Stepper activeStep={1} alternativeLabel>
          {['Account Created', 'Admin Verification', 'Ready to Login'].map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
      </div>

      <Alert severity="info" className="!mt-8">
        The administrator is reviewing your ID card. This usually takes 24-48 hours.
      </Alert>

      <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-lg bg-slate-50 p-4">
          <h2 className="font-bold text-slate-950">What next?</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Your ID card image will be verified.</li>
            <li>Admin approval is required before login access.</li>
            <li>You can log in after the account is approved.</li>
          </ul>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <h2 className="font-bold text-slate-950">Contact Admin</h2>
          <p className="mt-3 text-sm text-slate-600">Email: <strong>seller@shopkaro.com</strong></p>
          <p className="text-sm text-slate-600">Phone: <strong>+91-9999999999</strong></p>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button variant="contained" color="success" onClick={() => clearPendingAndGo('/login')}>Go to Login</Button>
        <Button variant="outlined" color="success" onClick={() => clearPendingAndGo('/')}>Home Page</Button>
      </div>
    </section>
  );
}

function VerificationPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingRegistrationEmail');
    if (!email && !pendingEmail) {
      navigate('/register');
      return;
    }
    if (email || pendingEmail) {
      localStorage.setItem('pendingRegistrationEmail', email || pendingEmail);
    }
  }, [email, navigate]);

  return (
    <div className="auth-flow-page">
      <VerificationPendingContent email={email} />
    </div>
  );
}

export default VerificationPending;
