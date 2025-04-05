"use client";

import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Snowflake, Wind, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching weather data
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch from a weather API
        // For demo purposes, we'll use mock data
        setTimeout(() => {
          const mockWeather: WeatherData = {
            temperature: 24,
            condition: "Sunny",
            humidity: 65,
            windSpeed: 12,
            location: "Lagos, Nigeria",
          };
          setWeather(mockWeather);
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError("Could not fetch weather data");
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <Sun className="h-10 w-10 text-yellow-500" />;
      case "cloudy":
        return <Cloud className="h-10 w-10 text-gray-400" />;
      case "rainy":
        return <CloudRain className="h-10 w-10 text-blue-400" />;
      case "snowy":
        return <Snowflake className="h-10 w-10 text-blue-200" />;
      default:
        return <Sun className="h-10 w-10 text-yellow-500" />;
    }
  };

  if (error) {
    return (
      <div className="bg-transparent rounded-lg p-4 border border-gray-200/50">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent rounded-lg p-4 px-20">
      <h3 className="text-sm font-medium text-gray-800 mb-3">
        Weather Conditions
      </h3>

      {loading ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-10 rounded-full bg-gray-200/70" />
            <Skeleton className="h-8 w-20 bg-gray-200/70" />
          </div>
          <Skeleton className="h-4 w-full bg-gray-200/70" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Skeleton className="h-12 w-full bg-gray-200/70" />
            <Skeleton className="h-12 w-full bg-gray-200/70" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm shadow-sm">
              {weather && getWeatherIcon(weather.condition)}
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-gray-800">
                {weather?.temperature}°C
              </span>
              <p className="text-sm text-gray-600">{weather?.condition}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2">{weather?.location}</p>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-3 rounded-lg flex items-center shadow-sm">
              <Droplets className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Humidity</p>
                <p className="text-sm font-medium text-gray-700">
                  {weather?.humidity}%
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-3 rounded-lg flex items-center shadow-sm">
              <Wind className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Wind</p>
                <p className="text-sm font-medium text-gray-700">
                  {weather?.windSpeed} km/h
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
