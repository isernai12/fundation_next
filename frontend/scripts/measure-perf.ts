import { chromium } from 'playwright';

async function run() {
  // Wait a moment for server to be fully ready
  await new Promise(r => setTimeout(r, 2000));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log("Logging in...");
  await page.goto('http://localhost:3000/login');
  
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('http://localhost:3000/');
  console.log("Logged in successfully.");

  const routes = [
    { name: 'Dashboard', url: '/' },
    { name: 'Members', url: '/members/manage' },
    { name: 'Beneficiaries', url: '/beneficiaries/manage' },
    { name: 'Donors', url: '/donors/manage' },
    { name: 'Groups', url: '/groups/manage' },
    { name: 'Fund Programs', url: '/groups/fund' },
    { name: 'Contributions', url: '/contributions/monthly' },
    { name: 'Loans', url: '/loans' },
    { name: 'Grants', url: '/grants/manage' },
  ];

  for (const route of routes) {
    const start = Date.now();
    await page.goto(`http://localhost:3000${route.url}`, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    console.log(`[${route.name}] Server Load Time: ${loadTime} ms`);
  }

  await browser.close();
}

run().catch(console.error);
