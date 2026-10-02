import { expect, type Page, test } from '@playwright/test';

async function mockWeatherApi(page: Page) {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
            latitude: -23.5475,
            longitude: -46.6361,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
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
      }),
    }),
  );
}

const viewports = [
  { name: '320px mobile', width: 320, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`mock weather flow works at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await mockWeatherApi(page);
    await page.goto('/');

    const search = page.getByRole('search', { name: 'Buscar cidade' });
    await search.getByRole('searchbox', { name: 'Nome da cidade' }).fill('São Paulo');
    await search.getByRole('button', { name: 'Buscar' }).click();
    await page.getByRole('button', { name: /São Paulo/ }).click();

    await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(5);
    await page.getByRole('button', { name: 'Fahrenheit' }).click();
    await expect(page.getByText('71 °F')).toBeVisible();

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth).toBeLessThanOrEqual(viewport.width);
  });
}
