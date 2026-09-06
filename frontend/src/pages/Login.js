import React from 'react';
import { LoginForm } from '../components/AuthForms';

function Login() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-2 py-4 sm:px-4 sm:py-10">
      <LoginForm />
    </div>
  );
}

export default Login;
