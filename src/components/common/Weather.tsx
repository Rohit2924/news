"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getWeatherData } from "@/lib/weather";

type Weather = {
  temp: number;
  description: string;
  icon: string;
  city: string;
};

export default function WeatherWidget({ city = "Kathmandu" }) {
  const [weather, setWeather] = useState<Weather | null>(null);

useEffect(() => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    setWeather({
      temp: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
    });
  });
}, []);



  useEffect(() => {
    async function fetchWeather() {
      const data = await getWeatherData(city);
      if (data) setWeather(data);
    }
    fetchWeather();
  }, [city]);

  if (!weather) {
    return <p className="text-sm text-gray-500">Loading weather...</p>;
  }

  return (
    <div className="flex items-center gap-3 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-full shadow-sm">
      <Image
        src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
        alt={weather.description}
        width={40}
        height={40}
      />
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {weather.city}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
          {Math.round(weather.temp)}°C • {weather.description}
        </span>
      </div>
    </div>
  );
}
