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

async function selectSuggestion(page: Page, name: RegExp) {
  await page.getByRole('button', { name }).click();
}

test('searches a city, shows its five-day forecast, and converts temperature', async ({ page }) => {
  await mockWeatherApi(page);
  await page.goto('/');

  await searchForCity(page);
  await expect(page.getByRole('button', { name: /São Paulo/ })).toBeVisible();
  await selectSuggestion(page, /São Paulo/);

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Resultados da busca' })).toBeFocused();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);
  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(page.getByText('71 °F')).toBeVisible();
  await page.getByRole('button', { name: 'Celsius' }).click();
  await expect(page.getByText('21 °C')).toBeVisible();
});

test('shows the empty state when geocoding has no results', async ({ page }) => {
  const api = await mockWeatherApi(page, {});
  await page.goto('/');

  await searchForCity(page, 'Cidade inexistente');

  await expect(page.getByRole('heading', { name: /Nenhuma cidade encontrada/ })).toBeVisible();
  expect(api.getForecastRequestCount()).toBe(0);
});

test('asks for a city on empty and whitespace-only searches without a request', async ({
  page,
}) => {
  let geocodingRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    geocodingRequests += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"results":[]}' });
  });
  await page.goto('/');
  const search = page.getByRole('search', { name: 'Buscar cidade' });
  const input = search.getByRole('searchbox', { name: 'Nome da cidade' });
  const submit = search.getByRole('button', { name: 'Buscar' });

  await submit.click();
  await expect(search.getByRole('alert')).toContainText('Digite o nome de uma cidade');
  await input.fill('   ');
  await submit.click();

  await expect(search.getByRole('alert')).toBeVisible();
  expect(geocodingRequests).toBe(0);
});

test('preserves the city, state, accents, and special characters in the search query', async ({
  page,
}) => {
  let requestedName = '';
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    requestedName = new URL(route.request().url()).searchParams.get('name') ?? '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [cityResult] }),
    });
  });
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(forecastResponse),
    }),
  );
  await page.goto('/');

  await searchForCity(page, 'São Paulo, SP & região');
  await selectSuggestion(page, /São Paulo/);

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  expect(requestedName).toBe('São Paulo, SP & região');
});

test('distinguishes homonymous cities and loads only the selected state', async ({ page }) => {
  const cities = [
    {
      id: 1,
      name: 'Springfield',
      admin1: 'Illinois',
      country: 'United States',
      latitude: 39.78,
      longitude: -89.64,
    },
    {
      id: 2,
      name: 'Springfield',
      admin1: 'Missouri',
      country: 'United States',
      latitude: 37.21,
      longitude: -93.29,
    },
  ];
  const requestedCoordinates: string[] = [];
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: cities }),
    }),
  );
  await page.route('https://api.open-meteo.com/**', async (route) => {
    const requestUrl = new URL(route.request().url());
    requestedCoordinates.push(
      `${requestUrl.searchParams.get('latitude')},${requestUrl.searchParams.get('longitude')}`,
    );
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(forecastResponse),
    });
  });
  await page.goto('/');

  await searchForCity(page, 'Springfield');
  await expect(page.getByRole('button', { name: /Springfield.*Illinois/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Springfield.*Missouri/ })).toBeVisible();
  expect(requestedCoordinates).toHaveLength(0);
  await selectSuggestion(page, /Springfield.*Missouri/);

  await expect(page.getByRole('heading', { name: 'Springfield' })).toBeVisible();
  expect(requestedCoordinates).toEqual(['37.21,-93.29']);
});

test('persists the selected unit after reload and opening another page', async ({ page }) => {
  await mockWeatherApi(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.close();

  const nextPage = await page.context().newPage();
  await nextPage.goto('/');
  await expect(nextPage.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('shows unavailable values for an incomplete forecast without NaN or undefined', async ({
  page,
}) => {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ results: [cityResult] }),
    }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ daily: { time: ['2026-10-01'] } }),
    }),
  );
  await page.goto('/');

  await searchForCity(page);
  await selectSuggestion(page, /São Paulo/);

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByText('Indisponível').first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/NaN|undefined/);
});

test('renders the main weather flow on a 375x812 mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockWeatherApi(page);
  await page.goto('/');

  await searchForCity(page);
  await selectSuggestion(page, /São Paulo/);

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(375);
});
