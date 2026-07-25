const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login');
  
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  console.log("Clicked submit. Waiting for navigation...");
  
  try {
    await page.waitForNavigation({ timeout: 5000 });
  } catch(e) {
    console.log("No navigation or timeout.");
  }
  
  console.log("Current URL:", page.url());
  
  await page.waitForTimeout(1000);
  console.log("Final URL:", page.url());
  
  await browser.close();
})();
