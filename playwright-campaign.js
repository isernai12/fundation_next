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
    
    console.log("Navigating to Campaign Details...");
    const res = await page.goto('http://localhost:3000/campaigns/102db5ae-351d-4172-bc19-9c64d319c827');
    if (!res.ok()) {
        const errorText = await page.locator('body').innerText();
        throw new Error(`Details page failed: ${res.status()}\n${errorText}`);
    }

    const text = await page.locator('body').innerText();
    if (text.includes('PrismaClientValidationError')) {
        throw new Error("Prisma Validation Error still exists!");
    }
    
    if (!text.includes('সর্বমোট সংগৃহীত')) {
        throw new Error("Page did not load correctly");
    }

    console.log("Campaign Details opened successfully!");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
