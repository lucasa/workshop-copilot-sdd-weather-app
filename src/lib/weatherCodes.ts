export interface WeatherInfo {
  label: string;
  icon: string;
}

const WEATHER_CODES: Record<number, WeatherInfo> = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Predomínio de sol', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Névoa', icon: '🌫️' },
  48: { label: 'Névoa congelante', icon: '🌫️' },
  51: { label: 'Garoa fraca', icon: '🌦️' },
  53: { label: 'Garoa moderada', icon: '🌦️' },
  55: { label: 'Garoa intensa', icon: '🌧️' },
  61: { label: 'Chuva fraca', icon: '🌦️' },
  63: { label: 'Chuva moderada', icon: '🌧️' },
  65: { label: 'Chuva intensa', icon: '🌧️' },
  71: { label: 'Neve fraca', icon: '🌨️' },
  73: { label: 'Neve moderada', icon: '🌨️' },
  75: { label: 'Neve intensa', icon: '❄️' },
  80: { label: 'Pancadas de chuva fracas', icon: '🌦️' },
  81: { label: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { label: 'Pancadas de chuva fortes', icon: '⛈️' },
  95: { label: 'Trovoadas', icon: '⛈️' },
  96: { label: 'Trovoadas com granizo', icon: '⛈️' },
  99: { label: 'Trovoadas intensas com granizo', icon: '⛈️' },
};

const UNKNOWN_WEATHER: WeatherInfo = {
  label: 'Condição indisponível',
  icon: '🌡️',
};

export function getWeatherInfo(code: number | undefined): WeatherInfo {
  return code === undefined ? UNKNOWN_WEATHER : (WEATHER_CODES[code] ?? UNKNOWN_WEATHER);
}

export function getWeatherIcon(code: number | undefined): string {
  return getWeatherInfo(code).icon;
}

export function getWeatherLabel(code: number | undefined): string {
  return getWeatherInfo(code).label;
}
