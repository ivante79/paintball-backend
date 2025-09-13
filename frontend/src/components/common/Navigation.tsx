import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          🎯 PaintBall Rezervacije
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Početna
          </Link>
          <Link to="/bookings" className="nav-link">
            Moje Rezervacije
          </Link>
          <Link to="/profile" className="nav-link">
            Profil
          </Link>
        </div>

        <div className="nav-user">
          <span className="nav-username">
            {user.firstName} {user.lastName}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Odjavi se
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;