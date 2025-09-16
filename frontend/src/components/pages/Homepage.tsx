import React, { useState, useEffect } from "react";
import { weatherAPI, bookingsAPI } from "../../services/api";
import { socketService } from "../../services/socket";
import { Weather, BookingFormData } from "../../types";

const Homepage: React.FC = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    bookingDate: "",
    timeSlot: "",
    numberOfPlayers: 6,
    equipment: "included",
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const timeSlots = [
    "09:00-11:00",
    "11:30-13:30",
    "14:00-16:00",
    "16:30-18:30",
    "19:00-21:00",
  ];

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    if (formData.bookingDate) {
      fetchAvailableSlots();
    }
  }, [formData.bookingDate]);

  const fetchWeather = async () => {
    try {
      const response = await weatherAPI.getCurrentWeather();
      setWeather(response.data.weather);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await bookingsAPI.getAvailableSlots(
        formData.bookingDate
      );
      setAvailableSlots(response.data.availableSlots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots(timeSlots);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfPlayers" ? parseInt(value) : value,
    }));
  };

  const calculatePrice = () => {
    const basePrice = 15;
    const equipmentFee = formData.equipment === "included" ? 5 : 0;
    return (basePrice + equipmentFee) * formData.numberOfPlayers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!formData.timeSlot) {
      setError("Molimo odaberite vremenski termin");
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        ...formData,
        totalPrice: calculatePrice(),
      };

      await bookingsAPI.createBooking(bookingData);
      setMessage("Rezervacija je uspješno kreirana!");
      setFormData({
        bookingDate: "",
        timeSlot: "",
        numberOfPlayers: 6,
        equipment: "included",
      });
      setAvailableSlots([]);
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Greška pri kreiranju rezervacije"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="homepage">
      <div className="hero-section">
        <h1>Dobrodošli u PaintBall Faks</h1>
        <p>Rezervirajte svoj termin za nezaboravnu paintball avanturu!</p>
      </div>

      <div className="content-grid">
        <div className="weather-widget">
          <h2>🌤️ Trenutno vrijeme</h2>
          {weather ? (
            <div className="weather-info">
              <div className="weather-main">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                  className="weather-icon"
                />
                <div className="weather-temp">{weather.temperature}°C</div>
              </div>
              <div className="weather-details">
                <p className="weather-desc">{weather.description}</p>
                <div className="weather-stats">
                  <span>💧 Vlažnost: {weather.humidity}%</span>
                  <span>💨 Vjetar: {weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="weather-loading">Učitava se...</div>
          )}
        </div>

        <div className="booking-form">
          <h2>📅 Rezervirajte termin</h2>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bookingDate">Datum rezervacije:</label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleInputChange}
                min={getTodayDate()}
                required
              />
            </div>

            {formData.bookingDate && (
              <div className="form-group">
                <label htmlFor="timeSlot">Vremenski termin:</label>
                <select
                  id="timeSlot"
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Odaberite termin</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {availableSlots.length === 0 && (
                  <p className="no-slots">
                    Nema dostupnih termina za odabrani datum
                  </p>
                )}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="numberOfPlayers">Broj igrača:</label>
                <input
                  type="number"
                  id="numberOfPlayers"
                  name="numberOfPlayers"
                  value={formData.numberOfPlayers}
                  onChange={handleInputChange}
                  min="2"
                  max="20"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="equipment">Oprema:</label>
                <select
                  id="equipment"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  required
                >
                  <option value="included">Uključena (+5 EUR/osoba)</option>
                  <option value="own">Vlastita oprema</option>
                </select>
              </div>
            </div>

            <div className="price-display">
              <strong>Ukupna cijena: {calculatePrice()} EUR</strong>
              <small>
                Osnovna cijena: 15 EUR po osobi (2 sata)
                {formData.equipment === "included" &&
                  " + 5 EUR oprema po osobi"}
              </small>
            </div>

            <button
              type="submit"
              className="booking-btn"
              disabled={loading || availableSlots.length === 0}
            >
              {loading ? "Rezervira se..." : "Rezerviraj termin"}
            </button>
          </form>
        </div>
      </div>

      <div className="gallery-section">
        <h2>Naš paintball centar</h2>
        <div className="gallery-grid">
          <div className="gallery-item">
            <img src="/images/paintball-field.jpg" alt="Paintball teren" />
            <div className="gallery-caption">Profesionalni teren</div>
          </div>
          <div className="gallery-item">
            <img src="/images/paintball-equipment.jpg" alt="Paintball oprema" />
            <div className="gallery-caption">Kvalitetna oprema</div>
          </div>
          <div className="gallery-item">
            <img src="/images/paintball-action.jpg" alt="Paintball akcija" />
            <div className="gallery-caption">Adrenalin i zabava</div>
          </div>
          <div className="gallery-item">
            <img src="/images/paintball-team.jpg" alt="Paintball tim" />
            <div className="gallery-caption">Timska igra</div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="facility-info">
          <h3>ℹ️ O nama</h3>
          <ul>
            <li>🏟️ Teren od 2000m²</li>
            <li>🎯 Profesionalna paintball oprema</li>
            <li>👨‍🏫 Iskusni instruktori</li>
            <li>🚗 Besplatno parkiranje</li>
          </ul>
        </div>

        <div className="rules-info">
          <h3>📋 Pravila</h3>
          <ul>
            <li>🔞 Minimum 12 godina</li>
            <li>👥 Minimum 6 igrača po rezervaciji</li>
            <li>⏰ Dolazak 30 minuta prije termina</li>
            <li>💳 Plaćanje unaprijed ili na licu mjesta</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
