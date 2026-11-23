import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("English interface labels and both install manifests are bundled without raw Arabic UI copy", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByLabel("اللغة", { exact: true }).selectOption("en");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  for (const path of ["/", "/duas", "/umrah", "/more", "/faq", "/support"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    const text = (await page.locator("body").innerText()).replaceAll(
      "العربية",
      "",
    );
    expect(text).not.toMatch(/[\u0600-\u06ff]/);
  }
  expect(
    await page.evaluate(async () => {
      const response = await fetch("/manifest-en.webmanifest");
      return response.ok && (await response.json()).dir === "ltr";
    }),
  ).toBe(true);
});
test("Arabic and English work offline; language changes retain exact drafts, FAQ search and older backups", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.getByRole("link", { name: "دعواتي", exact: true }).click();
  await page.getByRole("button", { name: "دعاء جديد", exact: true }).click();
  const text = "دعائي الأصلي 🌿 My own text  ".repeat(20);
  await page.getByLabel("نص الدعاء", { exact: true }).fill(text);
  await page.getByLabel("اللغة", { exact: true }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByLabel("Du’a text", { exact: true })).toHaveValue(text);
  await expect(
    page.getByRole("status").filter({ hasText: "Saved" }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "My du’as", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /دعائي الأصلي/ }).click();
  await expect(page.getByLabel("Du’a text", { exact: true })).toHaveValue(text);
  await page.goto("/faq");
  await expect(
    page.getByRole("heading", { name: "Umrah jurisprudence FAQ" }),
  ).toBeVisible();
  await page
    .getByLabel("Search Umrah questions", { exact: true })
    .fill("wheelchair");
  await expect(page.locator("[data-faq-id]")).toHaveCount(1);
  await expect(
    page.getByText(
      "Answer awaiting review; no unapproved ruling is displayed.",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Evidence and review methodology",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("dialog blockquote")).toHaveCount(0);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByLabel("Language", { exact: true }).selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "أسئلة فقه العمرة", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 850 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/faq-ar-320.png",
    fullPage: true,
  });
  await page.getByLabel("اللغة", { exact: true }).selectOption("en");
  await page.getByLabel("Search Umrah questions", { exact: true }).fill("");
  await page.screenshot({
    path: "test-results/faq-en-320.png",
    fullPage: true,
  });
  for (const path of ["/", "/duas", "/umrah", "/more", "/faq", "/support"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  // A pre-language v2 backup has no language preference; restore it through the real UI.
  await page.goto("/more");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export JSON backup", exact: true })
    .click();
  const download = await downloadPromise;
  const backup = JSON.parse(readFileSync((await download.path())!, "utf8"));
  backup.data.preferences = backup.data.preferences.filter(
    (p: { id: string }) => p.id !== "language",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByLabel("Restore backup (replaces current data)", { exact: true })
    .setInputFiles({
      name: "zaad-legacy-v2.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });
  await expect(
    page.getByText("Backup restored", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("link", { name: "My du’as", exact: true }).click();
  await page.getByRole("button", { name: /دعائي الأصلي/ }).click();
  await expect(page.getByLabel("Du’a text", { exact: true })).toHaveValue(text);
});
test("real waiting-worker update requires confirmation, preserves pending drafts, and rejects other open tabs", async ({
  page,
  context,
  request,
}) => {
  await request.get("http://127.0.0.1:4176/__test/release?next=0");
  await page.goto("http://127.0.0.1:4176/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.getByLabel("اللغة", { exact: true }).selectOption("en");
  await page.getByRole("link", { name: "My du’as", exact: true }).click();
  await page.getByRole("button", { name: "New du’a", exact: true }).click();
  await page.getByLabel("Du’a text", { exact: true }).fill("first text");
  await expect(
    page.getByRole("status").filter({ hasText: "Saved" }),
  ).toBeVisible();
  await request.get("http://127.0.0.1:4176/__test/release?next=1");
  await page.evaluate(async () => {
    await (await navigator.serviceWorker.getRegistration())?.update();
  });
  await expect(
    page.getByRole("button", { name: "Save data and update", exact: true }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "Save data and update", exact: true })
    .click();
  await expect(page.getByLabel("Du’a text", { exact: true })).toHaveValue(
    "first text",
  );
  const finalText = "آخر تعديل قبل التحديث — exact personal text 🌿 ".repeat(
    50,
  );
  await page.getByLabel("Du’a text", { exact: true }).fill(finalText);
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Save data and update", exact: true })
    .click();
  await expect(page.getByText(/update-test-next/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "My du’as", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /آخر تعديل قبل التحديث/ }).click();
  await expect(page.getByLabel("Du’a text", { exact: true })).toHaveValue(
    finalText,
  );
  // A second window may have in-memory edits: the new worker must refuse activation.
  const second = await context.newPage();
  await second.goto("http://127.0.0.1:4176/duas");
  await expect(
    second.getByRole("heading", { name: "My du’as", exact: true }),
  ).toBeVisible();
  await request.get("http://127.0.0.1:4176/__test/release?next=0");
  await page.evaluate(async () => {
    await (await navigator.serviceWorker.getRegistration())?.update();
  });
  await expect(
    page.getByRole("button", { name: "Save data and update", exact: true }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Save data and update", exact: true })
    .click();
  await expect(
    page.getByText(
      "Close other ZAAD windows and retry; the update was not activated.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByLabel("Du’a text", { exact: true })).toHaveValue(
    finalText,
  );
  await expect(page.getByText(/update-test-next/)).toBeVisible();
  await second.close();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Save data and update", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My du’as", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/update-test-next/)).toHaveCount(0);
  await page.getByRole("button", { name: /آخر تعديل قبل التحديث/ }).click();
  await expect(page.getByLabel("Du’a text", { exact: true })).toHaveValue(
    finalText,
  );
});
