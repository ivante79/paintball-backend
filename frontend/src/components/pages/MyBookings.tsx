import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import { socketService } from '../../services/socket';
import { Booking } from '../../types';

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();

    // Set up socket listeners for real-time updates
    const handleBookingUpdated = (data: any) => {
      setMessage(data.message);
      fetchBookings(); // Refresh booking list
    };

    const handleBookingCancelled = (data: any) => {
      setMessage(data.message);
      fetchBookings(); // Refresh booking list
    };

    const handleBookingStatusUpdated = (data: any) => {
      setMessage(data.message);
      fetchBookings(); // Refresh booking list
    };

    const handleReceiptUploaded = (data: any) => {
      setMessage(data.message);
      fetchBookings(); // Refresh booking list
    };

    // Register socket event listeners
    socketService.onBookingUpdated(handleBookingUpdated);
    socketService.onBookingCancelled(handleBookingCancelled);
    socketService.onBookingStatusUpdated(handleBookingStatusUpdated);
    socketService.onReceiptUploaded(handleReceiptUploaded);

    // Cleanup socket listeners on component unmount
    return () => {
      socketService.offBookingUpdated();
      socketService.offBookingCancelled();
      socketService.offBookingStatusUpdated();
      socketService.offReceiptUploaded();
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data);
    } catch (error: any) {
      setError('Greška pri učitavanju rezervacija');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Jeste li sigurni da želite otkazati rezervaciju?')) {
      return;
    }

    try {
      await bookingsAPI.cancelBooking(id.toString());
      setMessage('Rezervacija je uspješno otkazana');
      fetchBookings();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Greška pri otkazivanju rezervacije');
    }
  };

  const handleReceiptUpload = async (bookingId: number, file: File) => {
    setUploadingReceipt(bookingId);
    setError('');
    setMessage('');

    try {
      await bookingsAPI.uploadReceipt(bookingId.toString(), file);
      setMessage('Potvrda o plaćanju je uspješno otpremljena');
      fetchBookings();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Greška pri otpremanju potvrde');
    } finally {
      setUploadingReceipt(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Potvrđeno';
      case 'pending': return 'Na čekanju';
      case 'cancelled': return 'Otkazano';
      default: return status;
    }
  };

  if (loading) {
    return <div className="loading">Učitava se...</div>;
  }

  return (
    <div className="my-bookings">
      <div className="page-header">
        <h1>📅 Moje rezervacije</h1>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>Nemate aktivnih rezervacija.</p>
          <a href="/" className="btn-primary">Rezervirajte termin</a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-info">
                  <h3>Rezervacija #{booking.id}</h3>
                  <span className={`booking-status ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>
                <div className="booking-date">
                  {formatDate(booking.booking_date)} • {booking.time_slot}
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label">👥 Broj igrača:</span>
                  <span>{booking.number_of_players}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🎯 Oprema:</span>
                  <span>{booking.equipment === 'included' ? 'Uključena' : 'Vlastita'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">💰 Ukupna cena:</span>
                  <span><strong>{booking.total_price} RSD</strong></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Kreirana:</span>
                  <span>{formatDate(booking.created_at)}</span>
                </div>
              </div>

              <div className="booking-actions">
                {booking.status === 'pending' && (
                  <>
                    {!booking.payment_receipt && (
                      <div className="receipt-upload">
                        <label className="upload-btn">
                          {uploadingReceipt === booking.id ? (
                            'Šalje se...'
                          ) : (
                            '📎 Pošalji potvrdu o plaćanju'
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleReceiptUpload(booking.id, file);
                              }
                            }}
                            disabled={uploadingReceipt === booking.id}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    )}
                    
                    {booking.payment_receipt && (
                      <div className="receipt-status">
                        ✅ Potvrda o plaćanju je poslana
                      </div>
                    )}

                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn-danger"
                    >
                      Otkaži rezervaciju
                    </button>
                  </>
                )}

                {booking.status === 'confirmed' && (
                  <div className="confirmed-info">
                    <span className="confirmed-text">
                      ✅ Rezervacija je potvrđena! Vidimo se na terenu.
                    </span>
                  </div>
                )}

                {booking.status === 'cancelled' && (
                  <div className="cancelled-info">
                    <span className="cancelled-text">
                      ❌ Rezervacija je otkazana
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;