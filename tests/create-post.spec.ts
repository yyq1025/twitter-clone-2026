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

const signInAnonymously = async (page: Page) => {
  await openAnonymousSignIn(page);
  await page.getByRole("button", { name: "Sign in anonymously" }).click();
};

test("create post from home on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await signInAnonymously(page);

  await expect(page.getByRole("button", { name: "Post" })).toBeVisible();
  await page.getByRole("button", { name: "Post" }).first().click();

  const dialog = page.getByRole("dialog", { name: "Create Post" });
  const postContent = `e2e post ${Date.now()}`;

  await expect(dialog).toBeVisible();
  const editor = dialog.locator('[data-testid="editor"] .ProseMirror');
  await editor.click();
  await page.keyboard.type(postContent);
  await expect(editor).toContainText(postContent);

  await dialog.getByRole("button", { name: "Post" }).click();
  await expect(dialog).toBeHidden();

  await expect(page.getByText(postContent)).toBeVisible();
});
