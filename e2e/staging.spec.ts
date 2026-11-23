import { test, expect } from '@playwright/test';
import { testUser, testPassword } from '../scripts/hosting-test-helper.mjs';
test('authenticated staging shows source observations and feedback without an offline draft worker', async ({ browser, request }) => {
  const origin = 'http://127.0.0.1:4281';
  expect((await request.get(origin+'/review/faq')).status()).toBe(401);
  const context = await browser.newContext({httpCredentials:{username:testUser,password:testPassword}, viewport:{width:375,height:850}});
  const page = await context.newPage();
  await page.goto(origin+'/review');
  await page.getByRole('button',{name:'أفهم التحذير — عرض المسودات للتحرير',exact:true}).click();
  await page.getByLabel('اللغة',{exact:true}).selectOption('en');
  await expect(page.getByText(/Authenticated review requires a connection/).first()).toBeVisible();
  await expect(page.getByText('Online review', {exact:true})).toBeVisible();
  await expect(page.getByText('Preparing offline access', {exact:true})).toHaveCount(0);
  await page.getByLabel('Reader view',{exact:true}).selectOption('records');
  for (const id of ['B02','DUA-Q2-201','F01','F04','FAQ14']) {
    await page.getByLabel('Record',{exact:true}).selectOption(id);
    const check = page.locator(`[data-source-check="SC-${id === 'DUA-Q2-201' ? 'DUA' : id}-1"]`);
    await expect(check).toBeVisible();
    await expect(check.getByText('Source located; partial check only; complete coverage unconfirmed.',{exact:true})).toBeVisible();
    await expect(check.getByText('Not granted; record needs review',{exact:true})).toBeVisible();
  }
  await page.locator('.review-feedback > summary').click();
  await page.getByLabel('Editorial feedback — FAQ14',{exact:true}).fill('Source context needs qualified review 🌿');
  await expect(page.getByRole('status').filter({hasText:'Review feedback saved'})).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'I understand — show editorial drafts',exact:true}).click();
  await page.getByLabel('Reader view',{exact:true}).selectOption('records');
  await page.getByLabel('Record',{exact:true}).selectOption('FAQ14');
  await page.locator('.review-feedback > summary').click();
  await expect(page.getByLabel('Editorial feedback — FAQ14',{exact:true})).toHaveValue('Source context needs qualified review 🌿');
  expect(await page.evaluate(async()=>({workers:(await navigator.serviceWorker.getRegistrations()).length,caches:(await caches.keys()).length}))).toEqual({workers:0,caches:0});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/staging-source-review-375.png',fullPage:true});
  await context.close();
});
