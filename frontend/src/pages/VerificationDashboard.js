import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../services/api';
import '../styles/VerificationDashboard.css';

function VerificationDashboard() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState({});

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getPendingUsers(filter);
      console.log('Users fetched:', response.data);
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleVerify = async (userId, approved) => {
    try {
      const verificationNotes = notes[userId] || '';
      console.log('Verifying user:', userId, 'Approved:', approved);
      const response = await usersAPI.verifyUser(userId, approved, verificationNotes);
      console.log('Verification response:', response.data);
      fetchPendingUsers();
      setNotes(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      alert(approved ? '✅ User Verified!' : '❌ User Rejected!');
    } catch (err) {
      console.error('Verification error:', err);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="verification-dashboard">
      <div className="verification-header">
        <h1>🎖️ सैनिक सत्यापन डैशबोर्ड | Military Verification Dashboard</h1>
      </div>

      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          ⏳ Pending ({users.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          ✅ Verified
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          ❌ Rejected
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : users.length === 0 ? (
        <div className="no-users">
          <p>कोई उपयोगकर्ता नहीं मिला | No users found</p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map(user => (
            <div key={user._id} className="user-card">
              <div className="user-header">
                <h3>{user.name}</h3>
                <span className={`status-badge ${user.verificationStatus}`}>
                  {user.verificationStatus === 'pending' && '⏳ PENDING'}
                  {user.verificationStatus === 'verified' && '✅ VERIFIED'}
                  {user.verificationStatus === 'rejected' && '❌ REJECTED'}
                </span>
              </div>

              <div className="user-details">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Military ID:</strong> {user.militaryId}</p>
                <p><strong>Rank:</strong> {user.rank}</p>
              </div>

              {user.idCardImage && (
                <div className="id-card-image">
                  <img src={user.idCardImage} alt="ID Card" />
                  <p className="image-label">ID Card Image</p>
                </div>
              )}

              {user.verificationStatus === 'pending' && (
                <div className="verification-section">
                  <textarea
                    placeholder="Verification notes (optional) / टिप्पणी"
                    value={notes[user._id] || ''}
                    onChange={(e) => setNotes(prev => ({ ...prev, [user._id]: e.target.value }))}
                    className="notes-input"
                  />
                  <div className="action-buttons">
                    <button 
                      className="btn-approve"
                      onClick={() => handleVerify(user._id, true)}
                    >
                      ✅ Approve & Verify
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleVerify(user._id, false)}
                    >
                      ❌ Reject & Block
                    </button>
                  </div>
                </div>
              )}

              {user.verificationStatus !== 'pending' && user.verificationNotes && (
                <div className="notes-display">
                  <p><strong>Admin Notes:</strong></p>
                  <p>{user.verificationNotes}</p>
                </div>
              )}

              {user.verifiedAt && (
                <div className="verification-date">
                  <p>Verified on: {new Date(user.verifiedAt).toLocaleDateString('hi-IN')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VerificationDashboard;
