import { expect, test, type Page } from "@playwright/test";

const openAnonymousSignIn = async (page: Page) => {
  const loginButton = page.getByRole("button", { name: "Log in" });

  await expect(loginButton).toBeVisible();
  await loginButton.click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in anonymously" }),
  ).toBeVisible();
};

test("anonymous sign in unlocks desktop navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("tablist")).toBeVisible();

  await expect(page.getByTestId("desktop-post-trigger")).toBeHidden();
  await expect(
    page.getByRole("link", { name: "Notifications" }),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Bookmarks" })).toHaveCount(0);

  await openAnonymousSignIn(page);
  await page.getByRole("button", { name: "Sign in anonymously" }).click();

  await expect(page.getByTestId("desktop-post-trigger")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Notifications" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Bookmarks" })).toBeVisible();
});

test("anonymous sign in unlocks mobile navigation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("tablist")).toBeVisible();

  const mobileNav = page.getByTestId("mobile-bottom-nav");

  await expect(page.getByTestId("mobile-post-trigger")).toBeHidden();
  await expect(mobileNav).toBeHidden();

  await openAnonymousSignIn(page);
  await page.getByRole("button", { name: "Sign in anonymously" }).click();

  await expect(page.getByTestId("mobile-post-trigger")).toBeVisible();
  await expect(mobileNav).toBeVisible();
});

test("redirects anonymous users from bookmarks", async ({ page }) => {
  await page.goto("/bookmarks");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("tablist")).toBeVisible();
});

test("redirects anonymous users from notifications", async ({ page }) => {
  await page.goto("/notifications");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("tablist")).toBeVisible();
});
