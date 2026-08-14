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
    
    console.log("Navigating to Receive Donation...");
    const res = await page.goto('http://localhost:3000/donors/receive');
    if (!res.ok()) {
        const errorText = await page.locator('body').innerText();
        throw new Error(`Receive Donation page failed: ${res.status()}\n${errorText}`);
    }

    // Check if the form is present
    await page.waitForSelector('text=অনুদান গ্রহণ');
    const text = await page.locator('body').innerText();

    if (!text.includes('তহবিল গন্তব্য (Foundation Group)')) {
        throw new Error("Group field not found in form!");
    }

    console.log("Receive Donation page opened successfully!");
    
    // We will attempt to select a Group and verify the form structure
    const selects = await page.locator('button[role="combobox"]').all();
    
    // The second combobox should be Group
    if (selects.length < 2) {
        throw new Error("Could not find Group select!");
    }

    const groupSelect = selects[1];
    await groupSelect.click();
    
    // Wait for the options to appear
    await page.waitForSelector('div[role="option"]');
    console.log("Group selector successfully loaded!");

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
