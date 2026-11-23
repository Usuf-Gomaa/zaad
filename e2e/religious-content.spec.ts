import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { draftRecords } from "../src/content/drafts";
test("production has no draft route, normative text, approval bypass or editorial bundle", async ({
  page,
}) => {
  const js = readdirSync("dist/assets")
    .filter((f) => f.endsWith(".js"))
    .map((f) => readFileSync(`dist/assets/${f}`, "utf8"))
    .join("\n");
  for (const r of draftRecords) expect(js).not.toContain(r.summaryAr);
  expect(js).not.toContain(draftRecords[0].evidence[0].exactArabicText!);
  expect(js).not.toContain("zaad-editorial");
  expect(js).not.toContain("TEST REVIEWER ONLY");
  await page.goto("/review");
  await expect(
    page.getByText("الصفحة غير موجودة", { exact: false }),
  ).toBeVisible();
  await page.goto("/umrah?review=1");
  await expect(
    page.getByRole("heading", { name: "مراحل العمرة" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /مساحة المراجعة/ })).toHaveCount(
    0,
  );
  await expect(page.locator("[data-record-id]")).toHaveCount(0);
  for (const s of [2, 4]) {
    await page.getByRole("button", { name: new RegExp(`^${s + 1} `) }).click();
    await expect(
      page.getByRole("link", { name: "افتح دعواتي الآن" }),
    ).toHaveAttribute("href", "/duas");
  }
});
test("development requires opt-in, filters gender, opens local evidence offline and stores isolated review feedback", async ({
  page,
  context,
}) => {
  const requests: string[] = [];
  context.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:5175/")) requests.push(r.url());
  });
  await page.goto("http://127.0.0.1:5175/review");
  await expect(page.locator("[data-record-id]")).toHaveCount(0);
  await page
    .getByRole("button", { name: "أفهم التحذير — عرض المسودات للتحرير" })
    .click();
  await page.getByLabel("عرض المعاينة", { exact: true }).selectOption("women");
  await expect(page.locator('[data-record-id="A03"]')).toBeVisible();
  await expect(page.locator('[data-record-id="A02"]')).toHaveCount(0);
  await expect(page.locator('[data-record-id="A01"]')).toBeVisible();
  await page.getByLabel("عرض المعاينة", { exact: true }).selectOption("men");
  await expect(page.locator('[data-record-id="A02"]')).toBeVisible();
  await expect(page.locator('[data-record-id="A03"]')).toHaveCount(0);
  await page
    .locator('[data-record-id="A01"] .review-feedback > summary')
    .click();
  await page
    .getByLabel("ملاحظة تحريرية — A01", { exact: true })
    .fill("فحص السياق مطلوب — ملاحظة اختبار");
  await expect(
    page.getByText("حُفظت ملاحظة المراجعة", { exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "الأدلة وحالة المراجعة — A01", exact: true })
    .click();
  await expect(page.locator("dialog blockquote")).toHaveCount(0);
  await expect(
    page.getByRole("dialog").getByText(/لا يوجد اعتماد/),
  ).toBeVisible();
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  await page
    .locator('[data-record-id="A01"]')
    .getByText("مقارنة بالنسخة السابقة", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "فحص أدلة النسخة السابقة فقط", exact: true })
    .click();
  await expect(page.locator("dialog blockquote")).toBeVisible();
  await page.getByRole("button", { name: "إغلاق", exact: true }).click();
  await context.setOffline(false);
  await page.reload();
  await page
    .getByRole("button", { name: "أفهم التحذير — عرض المسودات للتحرير" })
    .click();
  await expect(
    page.getByLabel("ملاحظة تحريرية — A01", { exact: true }),
  ).toHaveValue("فحص السياق مطلوب — ملاحظة اختبار");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "تصدير ملاحظات المراجعة" }).click();
  expect((await download).suggestedFilename()).toBe(
    "zaad-editorial-feedback.json",
  );
  await page.setViewportSize({ width: 320, height: 850 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/review-320.png",
    fullPage: true,
  });
  expect(requests).toEqual([]);
});
