export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  time?: string;
  temperatureC?: number;
  apparentTemperatureC?: number;
  relativeHumidityPercent?: number;
  windSpeedKmh?: number;
  precipitationMm?: number;
  pressureHpa?: number;
  weatherCode?: number;
}

export interface ForecastDay {
  date: string;
  minimumC?: number;
  maximumC?: number;
  weatherCode?: number;
  precipitationProbabilityPercent?: number;
}

export interface WeatherData {
  city: City;
  current?: CurrentWeather;
  forecast: ForecastDay[];
}
