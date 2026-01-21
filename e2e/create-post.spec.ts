import { resolve } from "node:path";
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

test("create post", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await signInAnonymously(page);

  await expect(page.getByTestId("desktop-post-trigger")).toBeVisible();
  await page.getByTestId("desktop-post-trigger").click();

  const dialog = page.getByTestId("create-post-dialog");
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

test("create post with image", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await signInAnonymously(page);

  await expect(page.getByTestId("desktop-post-trigger")).toBeVisible();
  await page.getByTestId("desktop-post-trigger").click();

  const dialog = page.getByTestId("create-post-dialog");
  const postContent = `e2e image post ${Date.now()}`;
  const imagePath = resolve("e2e/fixtures/600x400.png");

  await expect(dialog).toBeVisible();
  const editor = dialog.locator('[data-testid="editor"] .ProseMirror');
  await editor.click();
  await page.keyboard.type(postContent);
  await expect(editor).toContainText(postContent);

  const fileInput = dialog.getByLabel("Choose images");
  await fileInput.setInputFiles(imagePath);
  await expect(dialog.getByRole("img", { name: "600x400.png" })).toBeVisible();

  await dialog.getByRole("button", { name: "Remove media" }).click();
  await expect(dialog.getByRole("img", { name: "600x400.png" })).toHaveCount(0);

  await fileInput.setInputFiles(imagePath);
  await expect(dialog.getByRole("img", { name: "600x400.png" })).toBeVisible();

  await dialog.getByRole("button", { name: "Post" }).click();
  await expect(dialog).toBeHidden();

  const postItem = page.locator("article", { hasText: postContent });
  await expect(postItem).toBeVisible();
  await expect(postItem.getByRole("img", { name: "Post media" })).toBeVisible();
});
