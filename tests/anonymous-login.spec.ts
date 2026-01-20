import { expect, test, type Page } from "@playwright/test";

const openAnonymousSignIn = async (page: Page) => {
  await page.goto("/");
  const loginButton = page.getByRole("button", { name: "Log in" });

  await expect(loginButton).toBeVisible();
  await loginButton.click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in anonymously" }),
  ).toBeVisible();
};


test("anonymous sign in shows post button on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await openAnonymousSignIn(page);
  await expect(page.getByRole("button", { name: "Post" })).toHaveCount(0);

  await page.getByRole("button", { name: "Sign in anonymously" }).click();

  await expect(page.getByRole("button", { name: "Post" })).toBeVisible();
});

test("anonymous sign in shows post button on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openAnonymousSignIn(page);
  await expect(
    page.getByRole("button", { name: "Create post" }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Sign in anonymously" }).click();

  await expect(
    page.getByRole("button", { name: "Create post" }),
  ).toBeVisible();
});
