import { test, expect } from '@playwright/test';

test.describe('Calypso Air - Silver Challenge Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173'); 
  });

  test('should add a new flight and show it in the table', async ({ page }) => {
    await page.fill('input[placeholder="Flight ID"]', '777');
    await page.fill('input[placeholder="Destination"]', 'Maldives');
    await page.fill('input[placeholder="Pilot Name"]', 'Captain Silver');
    await page.click('button:has-text("+ Add Flight")');
    
    const nextBtn = page.locator('button:has-text("Next")');
    while (await nextBtn.isEnabled()) {
      await nextBtn.click();
    }
    await expect(page.locator('text=Maldives')).toBeVisible();
  });

  test('should navigate to details and verify content', async ({ page }) => {
  await page.click('button:has-text("Details") >> nth=0');
  await expect(page.locator('text=Flight Details:')).toBeVisible();
  await page.click('button:has-text("Back to List")');
  await expect(page.locator('text=/Flight Management/')).toBeVisible();
}); 

  test('should show alert on duplicate ID', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('exists');
      await dialog.dismiss();
    });
    
    await page.fill('input[placeholder="Flight ID"]', '1'); 
    await page.fill('input[placeholder="Destination"]', 'Dubai');
    await page.fill('input[placeholder="Pilot Name"]', 'Test');
    await page.click('button:has-text("+ Add Flight")');
  });
});