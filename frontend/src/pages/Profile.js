import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import '../styles/Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setUser(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.updateProfile(formData);
      setUser(formData);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      <div className="profile-card">
        {!isEditing ? (
          <>
            <div className="profile-info">
              <div className="info-row">
                <label>Name:</label>
                <span>{user?.name}</span>
              </div>
              <div className="info-row">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-row">
                <label>Phone:</label>
                <span>{user?.phone}</span>
              </div>
              {user?.address && (
                <>
                  <div className="info-row">
                    <label>Address:</label>
                    <span>
                      {user.address.street}, {user.address.city}, {user.address.state} {user.address.zipCode}
                    </span>
                  </div>
                </>
              )}
            </div>
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name || ''}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email || ''}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone || ''}
              onChange={handleChange}
            />
            <input
              type="text"
              name="street"
              placeholder="Street"
              value={formData.address?.street || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, street: e.target.value }
              }))}
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.address?.city || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, city: e.target.value }
              }))}
            />
            <div className="form-actions">
              <button type="submit" className="btn-save">Save</button>
              <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
