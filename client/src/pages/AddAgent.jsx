// src/pages/AddAgent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../api';

const AddAgent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    const { name, email, mobile, password } = formData;
    if (!name || !email || !mobile || !password) {
      setError('All fields are required.');
      return;
    }
    // Basic validation for mobile number - more flexible
    if (mobile.length < 10) {
      setError('Mobile number must be at least 10 digits.');
      return;
    }

    setLoading(true);
    try {
      await fetchWithAuth('/agents', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setSuccess('Agent added successfully! Redirecting to dashboard...');
      // Redirect back to dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Agent</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">Mobile</label>
          <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Adding Agent...' : 'Add Agent'}
        </button>
      </form>
    </div>
  );
};

export default AddAgent;
