import React, { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, TextField } from '@mui/material';
import { usersAPI } from '../services/api';
import { page, panel } from '../utils/ui';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await usersAPI.getProfile();
        setUser(response.data);
        setFormData(response.data);
      } catch (error) {
        setMessage('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      address: { ...previous.address, [field]: value },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await usersAPI.updateProfile(formData);
      setUser(formData);
      setIsEditing(false);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage('Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className={`${page} grid min-h-[40vh] place-items-center`}>
        <CircularProgress color="success" />
      </div>
    );
  }

  return (
    <div className={page}>
      <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">My Profile</h1>
      {message && <Alert severity={message.includes('successfully') ? 'success' : 'error'} className="!mt-4">{message}</Alert>}

      <section className={`${panel} mt-3 p-4 sm:mt-6 sm:p-6`}>
        {!isEditing ? (
          <div className="grid gap-6">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {[
                ['Name', user?.name],
                ['Email', user?.email],
                ['Phone', user?.phone],
                ['Address', user?.address ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : 'Not added'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-slate-50 p-3 sm:p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 font-semibold text-slate-950">{value || 'Not added'}</p>
                </div>
              ))}
            </div>
            <Button variant="contained" color="success" className="!w-full sm:!w-max" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <TextField label="Name" name="name" value={formData.name || ''} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={formData.email || ''} onChange={handleChange} fullWidth />
            <TextField label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} fullWidth />
            <TextField label="Street" value={formData.address?.street || ''} onChange={(event) => handleAddressChange('street', event.target.value)} fullWidth />
            <TextField label="City" value={formData.address?.city || ''} onChange={(event) => handleAddressChange('city', event.target.value)} fullWidth />
            <TextField label="State" value={formData.address?.state || ''} onChange={(event) => handleAddressChange('state', event.target.value)} fullWidth />
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" variant="contained" color="success">Save</Button>
              <Button type="button" variant="outlined" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default Profile;
