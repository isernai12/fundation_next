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
    
    console.log("Navigating to Group page before donation...");
    await page.goto('http://localhost:3000/groups');
    await page.waitForSelector('text=Active');
    
    // Select first group to view details
    const groupLink = await page.locator('table a').first();
    const groupHref = await groupLink.getAttribute('href');
    console.log("Viewing group", groupHref);
    await page.goto(`http://localhost:3000${groupHref}`);
    
    // Wait for the balance to load
    await page.waitForTimeout(2000); // Wait for summary to load
    const balanceBeforeEl = await page.locator('text=Current Fund').locator('xpath=../..').locator('div.text-2xl').first().innerText();
    const donationsBeforeEl = await page.locator('text=Total Donations').locator('xpath=../..').locator('div.text-2xl').first().innerText();
    console.log("Before Donation - Balance:", balanceBeforeEl, "Total Donations:", donationsBeforeEl);
    
    const balanceBeforeStr = balanceBeforeEl.replace(/[^\d.]/g, '');
    const balanceBefore = balanceBeforeStr ? parseFloat(balanceBeforeStr) : 0;
    
    const donationsBeforeStr = donationsBeforeEl.replace(/[^\d.]/g, '');
    const donationsBefore = donationsBeforeStr ? parseFloat(donationsBeforeStr) : 0;
    
    console.log("Navigating to Receive Donation...");
    await page.goto('http://localhost:3000/donors/receive');
    await page.waitForSelector('text=অনুদান গ্রহণ');
    
    const selects = await page.locator('button[role="combobox"]').all();
    
    // Select Donor
    await selects[0].click();
    await page.waitForSelector('div[role="option"]');
    const donorOptions = await page.locator('div[role="option"]').all();
    await donorOptions[0].click();

    // Select Group
    await selects[1].click();
    await page.waitForSelector('div[role="option"]');
    const groupOptions = await page.locator('div[role="option"]').all();
    await groupOptions[0].click();

    // Fill amount
    const donationAmount = 1000;
    await page.fill('input[name="amount"]', donationAmount.toString());
    
    console.log("Submitting donation...");
    await page.click('button[type="submit"]');
    
    // Wait for redirect to ledger
    await page.waitForURL('**/donors/ledger');
    console.log("Redirected to Ledger successfully!");
    
    console.log("Navigating to Group page after donation...");
    await page.goto(`http://localhost:3000${groupHref}`);
    
    await page.waitForTimeout(2000);
    
    const balanceAfterEl = await page.locator('text=Current Fund').locator('xpath=../..').locator('div.text-2xl').first().innerText();
    const donationsAfterEl = await page.locator('text=Total Donations').locator('xpath=../..').locator('div.text-2xl').first().innerText();
    console.log("After Donation - Balance:", balanceAfterEl, "Total Donations:", donationsAfterEl);
    
    const balanceAfterStr = balanceAfterEl.replace(/[^\d.]/g, '');
    const balanceAfter = parseFloat(balanceAfterStr);
    
    const donationsAfterStr = donationsAfterEl.replace(/[^\d.]/g, '');
    const donationsAfter = parseFloat(donationsAfterStr);
    
    if (balanceAfter !== balanceBefore + donationAmount) {
        throw new Error(`Balance did not increase by ${donationAmount}. Before: ${balanceBefore}, After: ${balanceAfter}`);
    }
    
    if (donationsAfter !== donationsBefore + donationAmount) {
        throw new Error(`Total Donations did not increase by ${donationAmount}. Before: ${donationsBefore}, After: ${donationsAfter}`);
    }
    
    console.log("All tests passed! Group Balance and Total Donations increased correctly.");

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
