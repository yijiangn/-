"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "stormy";
  location: string;
}

function mapWmoCodeToCondition(code: number): WeatherData["condition"] {
  if (code <= 1) return "sunny";
  if (code <= 48) return "cloudy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "snowy";
  if (code <= 82) return "rainy";
  if (code <= 86) return "snowy";
  if (code <= 99) return "stormy";
  return "sunny";
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    window.clearTimeout(timer);
    return response;
  } catch (error) {
    window.clearTimeout(timer);
    throw error;
  }
}

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not available"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 8000,
      enableHighAccuracy: true,
      maximumAge: 600000
    });
  });
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchWeather() {
      try {
        setLoading(true);

        let latitude = 39.9042;
        let longitude = 116.4074;
        let location = "北京";

        try {
          const position = await getCurrentPosition();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          location = "当前位置";
        } catch {
          location = "北京";
        }

        const weatherResponse = await fetchWithTimeout(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        if (mounted && weatherData.current_weather) {
          setWeather({
            temp: Math.round(weatherData.current_weather.temperature),
            condition: mapWmoCodeToCondition(weatherData.current_weather.weathercode),
            location
          });
        }
      } catch {
        if (mounted) {
          setWeather({ temp: 24, condition: "sunny", location: "北京" });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void fetchWeather();
    const interval = window.setInterval(fetchWeather, 30 * 60 * 1000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return { weather, loading };
}
