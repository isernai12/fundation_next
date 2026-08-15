const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/login');
    
    console.log("Logging in...");
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    console.log("Navigating to Campaign Ledger...");
    const res = await page.goto('http://localhost:3000/campaigns/ledger');
    if (!res.ok()) throw new Error(`Ledger page failed: ${res.status()}`);

    const text = await page.locator('body').innerText();
    if (text.includes('লেজার মডিউল যুক্ত করা হয়নি')) {
        throw new Error("Placeholder page still exists!");
    }
    
    console.log("Selecting first campaign in dropdown...");
    const selectTrigger = await page.locator('button[role="combobox"]').first();
    if (await selectTrigger.isVisible()) {
        await selectTrigger.click();
        const firstItem = await page.locator('div[role="option"]').first();
        if (await firstItem.isVisible()) {
            await firstItem.click();
            await page.waitForSelector('text=মোট সংগ্রহ', { timeout: 10000 });
            
            const newText = await page.locator('body').innerText();
            if (!newText.includes('মোট সংগ্রহ') && !newText.includes('লেনদেন ইতিহাস')) {
                throw new Error("Ledger details didn't load!");
            }
            console.log("Ledger details loaded successfully!");
        } else {
            console.log("No campaigns available to select.");
        }
    } else {
        throw new Error("Selector not found!");
    }

    console.log("All verifications passed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
