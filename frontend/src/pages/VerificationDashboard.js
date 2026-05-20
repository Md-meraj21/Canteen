import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Chip, CircularProgress, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { usersAPI } from '../services/api';
import { page, panel, statusTone } from '../utils/ui';

function VerificationDashboard() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState({});
  const [message, setMessage] = useState('');

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getPendingUsers(filter);
      setUsers(response.data || []);
      setMessage('');
    } catch (err) {
      setMessage(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleVerify = async (userId, approved) => {
    try {
      await usersAPI.verifyUser(userId, approved, notes[userId] || '');
      fetchPendingUsers();
      setNotes((previous) => {
        const updated = { ...previous };
        delete updated[userId];
        return updated;
      });
      setMessage(approved ? 'User verified.' : 'User rejected.');
    } catch (err) {
      setMessage(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className={page}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Military Verification</p>
          <h1 className="text-3xl font-black text-slate-950">User Verification Dashboard</h1>
        </div>
        <Button variant="outlined" color="success" onClick={fetchPendingUsers}>Refresh</Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <ToggleButtonGroup color="success" value={filter} exclusive onChange={(_, value) => value && setFilter(value)}>
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="verified">Verified</ToggleButton>
          <ToggleButton value="rejected">Rejected</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {message && <Alert severity={message.includes('verified') || message.includes('rejected') ? 'success' : 'error'} className="!mt-5">{message}</Alert>}

      {loading ? (
        <div className="grid min-h-[30vh] place-items-center"><CircularProgress color="success" /></div>
      ) : users.length === 0 ? (
        <div className={`${panel} mt-6 p-8 text-center text-slate-500`}>No users found.</div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {users.map((user) => (
            <article key={user._id} className={`${panel} p-5`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{user.name}</h2>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <Chip label={user.verificationStatus} color={statusTone(user.verificationStatus)} />
              </div>

              <div className="mt-5 grid gap-2 text-sm">
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Military ID:</strong> {user.militaryId}</p>
                <p><strong>Rank:</strong> {user.rank}</p>
              </div>

              {user.idCardImage && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-bold text-slate-700">ID Card Image</p>
                  <img src={user.idCardImage} alt="ID Card" className="max-h-72 w-full rounded-lg border border-slate-200 object-contain" />
                </div>
              )}

              {user.verificationStatus === 'pending' && (
                <div className="mt-5 grid gap-3">
                  <TextField
                    label="Verification notes"
                    value={notes[user._id] || ''}
                    onChange={(event) => setNotes((previous) => ({ ...previous, [user._id]: event.target.value }))}
                    multiline
                    rows={3}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="contained" color="success" onClick={() => handleVerify(user._id, true)}>Approve and Verify</Button>
                    <Button variant="outlined" color="error" onClick={() => handleVerify(user._id, false)}>Reject and Block</Button>
                  </div>
                </div>
              )}

              {user.verificationStatus !== 'pending' && user.verificationNotes && (
                <Alert severity="info" className="!mt-5">Admin Notes: {user.verificationNotes}</Alert>
              )}
              {user.verifiedAt && <p className="mt-4 text-xs text-slate-500">Verified on: {new Date(user.verifiedAt).toLocaleDateString()}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default VerificationDashboard;
