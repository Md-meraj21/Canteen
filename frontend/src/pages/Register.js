import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, MenuItem, TextField } from '@mui/material';
import { authAPI } from '../services/api';
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

function Register() {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);

    try {
      await authAPI.register({
        ...formData,
        idCardImage: idCardPreview || null,
      });
      localStorage.setItem('pendingRegistrationEmail', formData.email);
      navigate('/verification-pending', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <section className={`${panel} p-6 sm:p-8`}>
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Defence personnel</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Military Registration</h1>
        <p className="mt-2 text-sm text-slate-500">Your account will be reviewed before shopping access is enabled.</p>

        {error && <Alert severity="error" className="!mt-5">{error}</Alert>}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
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
            Your ID card image will be sent to the administrator for verification.
          </Alert>

          <Button type="submit" variant="contained" color="success" size="large" disabled={loading} className="sm:col-span-2">
            {loading ? 'Registering...' : 'Register and Wait for Verification'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-700">Login</Link>
        </p>
      </section>
    </div>
  );
}

export default Register;
