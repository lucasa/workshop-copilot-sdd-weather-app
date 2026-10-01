import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, vi } from 'vitest';
import App from '../../../src/App';
import CurrentWeather from '../../../src/components/CurrentWeather';
import SearchBar from '../../../src/components/SearchBar';
import UnitToggle from '../../../src/components/UnitToggle';
import { getDayLabel } from '../../../src/lib/format';
import { convertTemperature } from '../../../src/lib/temperature';
import { mockWeatherData } from '../../../src/mocks/weather';
import type { Unit } from '../../../src/types/weather';

function mockWeatherApi(failFirstSearch = false) {
  let shouldFailSearch = failFirstSearch;
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
    const url = new URL(String(input));

    if (url.hostname === 'geocoding-api.open-meteo.com') {
      if (shouldFailSearch) {
        shouldFailSearch = false;
        return new Response(null, { status: 503 });
      }

      const results =
        url.searchParams.get('name') === 'Lisboa'
          ? []
          : [
              {
                id: mockWeatherData.city.id,
                name: mockWeatherData.city.name,
                admin1: mockWeatherData.city.admin1,
                country: mockWeatherData.city.country,
                country_code: mockWeatherData.city.countryCode,
                latitude: mockWeatherData.city.latitude,
                longitude: mockWeatherData.city.longitude,
                timezone: mockWeatherData.city.timezone,
              },
            ];
      return new Response(JSON.stringify({ results }), { status: 200 });
    }

    return new Response(
      JSON.stringify({
        current: {
          time: mockWeatherData.current?.time,
          temperature_2m: mockWeatherData.current?.temperatureC,
          apparent_temperature: mockWeatherData.current?.apparentTemperatureC,
          relative_humidity_2m: mockWeatherData.current?.relativeHumidityPercent,
          wind_speed_10m: mockWeatherData.current?.windSpeedKmh,
          weather_code: mockWeatherData.current?.weatherCode,
        },
        daily: {
          time: mockWeatherData.forecast.map((day) => day.date),
          temperature_2m_min: mockWeatherData.forecast.map((day) => day.minimumC),
          temperature_2m_max: mockWeatherData.forecast.map((day) => day.maximumC),
          weather_code: mockWeatherData.forecast.map((day) => day.weatherCode),
          precipitation_probability_max: mockWeatherData.forecast.map(
            (day) => day.precipitationProbabilityPercent,
          ),
        },
      }),
      { status: 200 },
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function TemperatureUnitFixture() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <CurrentWeather city={mockWeatherData.city} current={{ temperatureC: 0 }} unit={unit} />
      <UnitToggle unit={unit} onChange={setUnit} />
    </>
  );
}

describe('weather UI', () => {
  it('does not submit an empty SearchBar value', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.submit(screen.getByRole('search', { name: 'Buscar cidade' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('submits the trimmed SearchBar value', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Nome da cidade' }), {
      target: { value: '  São Paulo  ' },
    });
    fireEvent.submit(screen.getByRole('search', { name: 'Buscar cidade' }));

    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });

  it('updates a zero-degree current temperature when Fahrenheit is selected', () => {
    render(<TemperatureUnitFixture />);

    fireEvent.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('32 °F')).toBeInTheDocument();
  });

  it('converts Celsius to Fahrenheit and formats forecast days locally', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(getDayLabel('2026-10-01', 0)).toBe('Hoje');
    expect(getDayLabel('2026-10-02', 1)).toBe('Amanhã');
  });

  it('supports keyboard navigation in the unit toggle', () => {
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    const celsiusButton = screen.getByRole('button', { name: 'Celsius' });
    const fahrenheitButton = screen.getByRole('button', { name: 'Fahrenheit' });
    fireEvent.keyDown(celsiusButton, { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith('fahrenheit');
    expect(fahrenheitButton).toHaveFocus();
  });

  it('identifies missing current-weather values without fabricating data', () => {
    render(<CurrentWeather city={mockWeatherData.city} current={undefined} unit="celsius" />);

    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
  });

  it('loads city weather, shows five days, and converts temperatures when the unit changes', async () => {
    mockWeatherApi();
    render(<App />);
    const searchInput = screen.getByRole('searchbox', { name: 'Nome da cidade' });

    fireEvent.change(searchInput, { target: { value: 'São Paulo' } });
    fireEvent.submit(screen.getByRole('search'));

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);

    fireEvent.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(await screen.findByText('71 °F')).toBeInTheDocument();
  });

  it('shows the empty state for cities without a local fixture', async () => {
    mockWeatherApi();
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Nome da cidade' }), {
      target: { value: 'Lisboa' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada para “Lisboa”' }),
    ).toBeInTheDocument();
  });

  it('shows a recoverable error state and retries the search', async () => {
    mockWeatherApi(true);
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Nome da cidade' }), {
      target: { value: 'São Paulo' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
  });
});
