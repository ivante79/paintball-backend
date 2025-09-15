import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { bookingsAPI } from "../../services/api";
import { Booking } from "../../types";

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      });
      fetchBookingStats();
    }
  }, [user]);

  const fetchBookingStats = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      const bookings: Booking[] = response.data;

      const stats = bookings.reduce(
        (acc, booking) => {
          acc.total++;
          acc[booking.status as keyof typeof acc]++;
          return acc;
        },
        {
          total: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0,
        }
      );

      setBookingStats(stats);
    } catch (error) {
      console.error("Error fetching booking stats:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await updateProfile(formData);
      setMessage("Profil je uspješno ažuriran");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
    setError("");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("sr-RS");
  };

  if (!user) {
    return <div className="loading">Učitava se...</div>;
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>👤 Moj profil</h1>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>📝 Osobni podaci</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary"
              >
                Uredi profil
              </button>
            )}
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="profile-info">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Ime:</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Prezime:</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefon:</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email adresa se ne može mijenjati</small>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Čuva se..." : "Spremi izmjene"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Odustani
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-display">
                <div className="info-row">
                  <span className="info-label">Ime i prezime:</span>
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Telefon:</span>
                  <span>{user.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Uloga:</span>
                  <span className="user-role">
                    {user.role === "admin" ? "Administrator" : "Korisnik"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Član od:</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2>📊 Statistike rezervacija</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{bookingStats.total}</div>
              <div className="stat-label">Ukupno rezervacija</div>
            </div>
            <div className="stat-card stat-confirmed">
              <div className="stat-number">{bookingStats.confirmed}</div>
              <div className="stat-label">Potvrđene</div>
            </div>
            <div className="stat-card stat-pending">
              <div className="stat-number">{bookingStats.pending}</div>
              <div className="stat-label">Na čekanju</div>
            </div>
            <div className="stat-card stat-cancelled">
              <div className="stat-number">{bookingStats.cancelled}</div>
              <div className="stat-label">Otkazane</div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>ℹ️ Korisne informacije</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>📞 Kontakt</h3>
              <p>Telefon: +385 99 123 4567</p>
              <p>Email: info@paintballrezervacije.hr</p>
            </div>
            <div className="info-card">
              <h3>⏰ Radno vrijeme</h3>
              <p>Ponedjeljak - Petak: 09:00 - 21:00</p>
              <p>Subota - Nedjelja: 08:00 - 22:00</p>
            </div>
            <div className="info-card">
              <h3>📍 Lokacija</h3>
              <p>Paintball centar Osijek</p>
              <p>Osijek, Donji grad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
