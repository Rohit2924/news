export async function getWeatherData(city: string) {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY; // safer to store in .env
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch weather");
    const data = await response.json();
    return {
      temp: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    return null;
  }
}
