import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Auth.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    militaryId: '',
    rank: ''
  });
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image before saving
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large
          if (width > 800) {
            height = (height * 800) / width;
            width = 800;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress with quality setting
          const compressedImage = canvas.toDataURL('image/jpeg', 0.6); // 60% quality
          setIdCardPreview(compressedImage);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare form data
      const dataToSend = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        militaryId: formData.militaryId,
        rank: formData.rank,
        idCardImage: idCardPreview || null // Send base64 string directly
      };

      await authAPI.register(dataToSend);
      localStorage.setItem('pendingRegistrationEmail', formData.email);
      // Don't auto login - user needs verification first
      navigate('/verification-pending', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-military">
        <h1>🎖️ सेना रजिस्ट्रेशन | Military Registration</h1>
        <p className="military-note">Defence Personnel के लिए विशेष रजिस्ट्रेशन</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name / पूरा नाम"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Unique Username"
            value={formData.username}
            onChange={handleChange}
            minLength="3"
            pattern="[A-Za-z0-9_]+"
            title="Only letters, numbers, and underscores are allowed"
            required
          />
          <input
            type="text"
            inputMode="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          
          <input
            type="text"
            name="militaryId"
            placeholder="Military ID / सैन्य आईडी"
            value={formData.militaryId}
            onChange={handleChange}
            required
          />
          
          <select
            name="rank"
            value={formData.rank}
            onChange={handleChange}
            required
          >
            <option value="">Select Rank / रैंक चुनें</option>
            <option value="Subedar Major">Subedar Major</option>
            <option value="Subedar">Subedar</option>
            <option value="Naib Subedar">Naib Subedar</option>
            <option value="Havildar Major">Havildar Major</option>
            <option value="Havildar">Havildar</option>
            <option value="Naib Havildar">Naib Havildar</option>
            <option value="Lance Naik">Lance Naik</option>
            <option value="Sepoy">Sepoy</option>
            <option value="Officer">Officer</option>
            <option value="Jawan">Jawan</option>
          </select>

          <div className="id-card-upload">
            <label>ID Card Image / आईडी कार्ड की फोटो *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {idCardPreview && (
              <div className="id-card-preview">
                <img src={idCardPreview} alt="ID Card Preview" />
              </div>
            )}
          </div>

          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="military-warning">
            ⚠️ आपकी ID कार्ड की तस्वीर सत्यापन के लिए प्रशासक को भेजी जाएगी
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : '✓ Register & Wait for Verification'}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;
