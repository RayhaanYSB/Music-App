import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile form state
  const [profileData, setProfileData] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    profile_picture_url: user?.profile_picture_url || '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await userAPI.updateProfile(profileData);
      setSuccess('Profile updated successfully!');
      
      // Reload page to show updated info
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await userAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      setSuccess('Password changed successfully! Please log in again.');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

      // Log out and redirect to login
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="container">
        <h1>Settings</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Profile Settings */}
        <div className="settings-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="disabled-input"
              />
              <small className="form-help">Username cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="disabled-input"
              />
              <small className="form-help">Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                name="display_name"
                value={profileData.display_name}
                onChange={handleProfileChange}
                placeholder="How should we call you?"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Profile Picture URL</label>
              <input
                type="url"
                name="profile_picture_url"
                value={profileData.profile_picture_url}
                onChange={handleProfileChange}
                placeholder="https://example.com/your-image.jpg"
              />
              <small className="form-help">Enter a URL to your profile picture</small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="settings-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
                placeholder="Enter your current password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                minLength="6"
                placeholder="At least 6 characters"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
                placeholder="Re-enter your new password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;