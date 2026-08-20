import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from './AuthForms';
import { ForgotPasswordForm } from '../pages/ForgotPassword';
import { VerificationPendingContent } from '../pages/VerificationPending';

function AuthModal({ open, mode, onModeChange, onClose }) {
  const navigate = useNavigate();
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const isRegister = mode === 'register';
  const isVerification = mode === 'verification';
  const isWide = isRegister || isVerification;
  const title = {
    forgot: 'Reset password',
    login: 'Login',
    register: 'Military Registration',
    verification: 'Admin Verification',
  }[mode] || 'Login';
  const paperClassName = `auth-modal-paper ${isWide ? 'auth-modal-paper-register' : ''}`;

  const showVerificationPending = (email) => {
    setPendingVerificationEmail(email);
    onModeChange('verification');
  };

  const goHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isWide ? 'md' : 'sm'}
      className="auth-modal"
      PaperProps={{
        className: paperClassName,
      }}
      slotProps={{
        paper: {
          className: paperClassName,
        },
      }}
    >
      <div className="auth-modal-shell">
        <section className="auth-modal-main">
          <DialogTitle className="auth-modal-title !p-0">
            <span className="sr-only">{title}</span>
            <IconButton onClick={onClose} aria-label="Close login popup" size="small" className="auth-modal-close">
              <FaTimes />
            </IconButton>
          </DialogTitle>

          <DialogContent className={`auth-modal-content ${isWide ? 'auth-modal-content-register' : ''} !p-0`}>
            {mode === 'register' && (
              <RegisterForm
                variant="modal"
                onSwitchMode={() => onModeChange('login')}
                onVerificationPending={showVerificationPending}
                onNavigateAway={onClose}
              />
            )}
            {mode === 'forgot' && (
              <ForgotPasswordForm
                variant="modal"
                onBackToLogin={() => onModeChange('login')}
              />
            )}
            {mode === 'verification' && (
              <VerificationPendingContent
                variant="modal"
                email={pendingVerificationEmail}
                onLogin={() => onModeChange('login')}
                onHome={goHome}
              />
            )}
            {(!mode || mode === 'login') && (
              <LoginForm
                variant="modal"
                onSuccess={onClose}
                onSwitchMode={() => onModeChange('register')}
                onForgotPassword={() => onModeChange('forgot')}
                onNavigateAway={onClose}
              />
            )}
          </DialogContent>
        </section>
      </div>
    </Dialog>
  );
}

export default AuthModal;
