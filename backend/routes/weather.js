const express = require("express");
const axios = require("axios");

const router = express.Router();

// Get current weather
router.get("/current", async (req, res) => {
  try {
    const { city = "Zagreb" } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;
    console.log("apikey", apiKey);
    if (!apiKey) {
      return res.status(500).json({
        message: "Weather API key not configured",
        weather: {
          temperature: 22,
          description: "Clear sky",
          icon: "01d",
          humidity: 60,
          windSpeed: 5,
        },
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    console.log(response.data, "weather api response");
    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      windSpeed: Math.round(response.data.wind.speed),
      city: response.data.name,
    };

    res.json({ weather: weatherData });
  } catch (error) {
    console.error("Weather API error:", error.message);

    // Return mock data if API fails
    res.json({
      weather: {
        temperature: 22,
        description: "Clear sky",
        icon: "01d",
        humidity: 60,
        windSpeed: 5,
        city: "Zagreb",
      },
      message: "Using mock weather data",
    });
  }
});

// Get weather forecast for next 5 days
router.get("/forecast", async (req, res) => {
  try {
    const { city = "Zagreb" } = req.query;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Weather API key not configured",
        forecast: [
          {
            date: new Date().toISOString(),
            temperature: 22,
            description: "Clear sky",
            icon: "01d",
          },
          {
            date: new Date(Date.now() + 86400000).toISOString(),
            temperature: 24,
            description: "Partly cloudy",
            icon: "02d",
          },
          {
            date: new Date(Date.now() + 172800000).toISOString(),
            temperature: 20,
            description: "Light rain",
            icon: "10d",
          },
        ],
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );

    // Get daily forecast (every 24 hours from the 5-day forecast)
    const dailyForecast = [];
    const processedDates = new Set();

    response.data.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dateString = date.toDateString();

      if (!processedDates.has(dateString) && dailyForecast.length < 5) {
        dailyForecast.push({
          date: date.toISOString(),
          temperature: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        });
        processedDates.add(dateString);
      }
    });

    res.json({ forecast: dailyForecast });
  } catch (error) {
    console.error("Weather forecast API error:", error.message);

    // Return mock data if API fails
    const mockForecast = [];
    for (let i = 0; i < 5; i++) {
      mockForecast.push({
        date: new Date(Date.now() + i * 86400000).toISOString(),
        temperature: 20 + Math.random() * 10,
        description: ["Clear sky", "Partly cloudy", "Light rain", "Sunny"][
          Math.floor(Math.random() * 4)
        ],
        icon: ["01d", "02d", "10d", "01d"][Math.floor(Math.random() * 4)],
      });
    }

    res.json({
      forecast: mockForecast,
      message: "Using mock weather data",
    });
  }
});

module.exports = router;
