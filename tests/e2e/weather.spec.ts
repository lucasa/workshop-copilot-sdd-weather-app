import { expect, type Page, test } from '@playwright/test';

const cityResult = {
  id: 3448439,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  country_code: 'BR',
  latitude: -23.5475,
  longitude: -46.6361,
  timezone: 'America/Sao_Paulo',
};

const forecastResponse = {
  current: {
    time: '2026-10-01T14:00',
    temperature_2m: 21.4,
    apparent_temperature: 22.1,
    relative_humidity_2m: 68,
    wind_speed_10m: 12.3,
    weather_code: 2,
  },
  daily: {
    time: ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'],
    temperature_2m_min: [16.2, 17, 18.1, 17.5, 16.8],
    temperature_2m_max: [25, 26.1, 27.3, 24.8, 23.9],
    weather_code: [2, 3, 1, 61, 2],
    precipitation_probability_max: [10, 15, 5, 70, 20],
  },
};

async function mockWeatherApi(page: Page, geocodingResponse: object = { results: [cityResult] }) {
  let forecastRequests = 0;

  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(geocodingResponse),
    }),
  );
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecastRequests += 1;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(forecastResponse),
    });
  });

  return { getForecastRequestCount: () => forecastRequests };
}

async function searchForCity(page: Page, cityName = 'São Paulo') {
  const search = page.getByRole('search', { name: 'Buscar cidade' });
  await search.getByRole('searchbox', { name: 'Nome da cidade' }).fill(cityName);
  await search.getByRole('button', { name: 'Buscar' }).click();
}

test('searches a city, shows its five-day forecast, and converts temperature', async ({ page }) => {
  await mockWeatherApi(page);
  await page.goto('/');

  await searchForCity(page);

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);
  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(page.getByText('71 °F')).toBeVisible();
});

test('shows the empty state when geocoding has no results', async ({ page }) => {
  const api = await mockWeatherApi(page, {});
  await page.goto('/');

  await searchForCity(page, 'Cidade inexistente');

  await expect(page.getByRole('heading', { name: /Nenhuma cidade encontrada/ })).toBeVisible();
  expect(api.getForecastRequestCount()).toBe(0);
});

test('renders the main weather flow on a 375x812 mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockWeatherApi(page);
  await page.goto('/');

  await searchForCity(page);

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(375);
});
