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
    
    console.log("Navigating to Campaign Manage...");
    const manageRes = await page.goto('http://localhost:3000/campaigns/manage');
    if (!manageRes.ok()) throw new Error(`Manage page failed: ${manageRes.status()}`);
    console.log("Manage page loaded successfully.");

    // Check if dropdown menu trigger is present
    const actionBtn = await page.locator('button:has(.lucide-more-horizontal)').first();
    if (await actionBtn.isVisible()) {
      console.log("Actions dropdown trigger found.");
      // Open the dropdown
      await actionBtn.click();
      
      // Look for the "বিস্তারিত দেখুন" menu item text
      const viewDetailsItem = await page.locator('text=বিস্তারিত দেখুন').first();
      if (await viewDetailsItem.isVisible()) {
        console.log("Dropdown menu items are rendering successfully.");
      } else {
        throw new Error("Dropdown menu items not rendering!");
      }
    } else {
      console.log("No campaigns found to check dropdown, but page loaded fine.");
    }

    console.log("All verifications passed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
