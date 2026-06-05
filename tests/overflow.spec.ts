import { test, expect } from "@playwright/test";

/**
 * Regression guard: the hero searchlight once overflowed horizontally on
 * mobile, stretching the layout viewport and pushing the fixed nav's
 * hamburger off-screen. These assertions fail if that ever returns.
 */
const WIDTHS = [360, 390, 414];

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    // Let the hero, fonts, and WebGL canvas settle.
    await page.waitForTimeout(1500);

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(scrollWidth, "page must not scroll horizontally").toBeLessThanOrEqual(
      clientWidth + 1,
    );
  });

  test(`hamburger stays within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");

    const toggle = page.locator(".nav-toggle");
    await expect(toggle).toBeVisible();

    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x + box.width, "hamburger right edge must be on-screen").toBeLessThanOrEqual(
        width + 1,
      );
    }
  });
}
