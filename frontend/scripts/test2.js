const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    await page.goto('http://localhost:3000/groups/fund');
    await page.waitForTimeout(2000);
    
    // Select first group
    const selects1 = await page.locator('button[role="combobox"]').all();
    if(selects1.length > 0) {
      await selects1[0].click();
      await page.waitForSelector('div[role="option"]');
      const options1 = await page.locator('div[role="option"]').all();
      if(options1.length > 0) {
          await options1[0].click();
          await page.waitForTimeout(2000);
      }
    }
    
    const html = await page.content();
    console.log("HTML length:", html.length);
    
    const balanceEl = await page.locator('text=Current Balance').locator('xpath=../..').locator('.text-green-600').innerText().catch(() => "Not found");
    const donationsEl = await page.locator('text=Total Donations').locator('xpath=../..').locator('div.text-2xl').first().innerText().catch(() => "Not found");
    console.log("Group Fund -> Balance:", balanceEl, "Total Donations:", donationsEl);
    
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
