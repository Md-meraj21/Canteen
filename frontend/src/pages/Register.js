import React from 'react';
import { RegisterForm } from '../components/AuthForms';

function Register() {
  return (
    <div className="app-page mx-auto w-full max-w-3xl px-2 py-3 sm:px-4 sm:py-10">
      <RegisterForm />
    </div>
  );
}

export default Register;
