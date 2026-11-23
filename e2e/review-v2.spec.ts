import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { reviewRecords } from "../src/content/review-v2/records";
import { reviewPackSha256 } from "../src/content/review-v2/pack-data";
test("public build excludes every v2 paragraph and cannot enable protected routes through client flags", async ({
  page,
}) => {
  const scripts =
    readdirSync("dist/assets")
      .filter((f) => f.endsWith(".js"))
      .map((f) => readFileSync(`dist/assets/${f}`, "utf8"))
      .join("\n") + readFileSync("dist/sw.js", "utf8");
  for (const record of reviewRecords) {
    expect(scripts).not.toContain(record.summaryAr);
    expect(scripts).not.toContain(record.detailsAr!);
  }
  expect(scripts).not.toContain(reviewPackSha256);
  expect(scripts).not.toContain("zaad-editorial");
  expect(existsSync("dist/review-build.json")).toBe(false);
  await page.addInitScript(() => {
    (
      window as unknown as { __EDITORIAL_REVIEW__: boolean }
    ).__EDITORIAL_REVIEW__ = true;
  });
  await page.goto("/review/faq?review=1");
  await expect(
    page.getByText("الصفحة غير موجودة", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("[data-record-id]")).toHaveCount(0);
});
test("private v2 review browses rites and all FAQ drafts offline with entered feedback, exports and no approval changes", async ({
  page,
  context,
  request,
}) => {
  const origin = "http://127.0.0.1:4180";
  expect(
    (
      await request.get(`${origin}/review`, {
        headers: { Host: "untrusted.example" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (await request.post(`${origin}/review`, { data: "not uploaded" })).status(),
  ).toBe(405);
  const remote: string[] = [];
  context.on("request", (r) => {
    if (!r.url().startsWith(origin + "/")) remote.push(r.url());
  });
  await page.goto(origin + "/review");
  await expect(
    page.getByText("مسودة للمراجعة الشرعية — غير معتمدة للنشر", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("[data-record-id]")).toHaveCount(0);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page
    .getByRole("button", {
      name: "أفهم التحذير — عرض المسودات للتحرير",
      exact: true,
    })
    .click();
  const a01 = page.locator('[data-record-id="A01"]');
  await expect(
    a01.getByText(reviewRecords[0].summaryAr, { exact: true }),
  ).toBeVisible();
  await a01.getByText("التفصيل والسياق", { exact: true }).click();
  await expect(
    a01.getByText(reviewRecords[0].detailsAr!, { exact: true }),
  ).toBeVisible();
  await a01.locator(".review-feedback > summary").click();
  await a01
    .getByLabel("اسم المراجع — A01", { exact: true })
    .fill("اسم أدخله المراجع في الاختبار");
  await a01
    .getByLabel("رأي المراجع — A01", { exact: true })
    .selectOption("agree");
  const note = "ملاحظة مراجع 🌿\nلا اعتماد من الضغط على موافق";
  await a01.getByLabel("ملاحظة تحريرية — A01", { exact: true }).fill(note);
  await expect(
    a01.getByText("حُفظت ملاحظة المراجعة", { exact: true }),
  ).toBeVisible();
  const oneDownload = page.waitForEvent("download");
  await a01
    .getByRole("button", { name: "تصدير هذا السجل JSON", exact: true })
    .click();
  const one = JSON.parse(
    readFileSync((await (await oneDownload).path())!, "utf8"),
  );
  expect(one.records).toHaveLength(1);
  expect(one.records[0].reviewStatus).toBe("needs_review");
  expect(one.records[0].reviewedBy).toBeNull();
  expect(one.records[0].evidence[0].verified).toBe(false);
  expect(one.feedback[0].decision).toBe("agree");
  expect(one.feedback[0].reviewerName).toBe("اسم أدخله المراجع في الاختبار");
  expect(one.feedback[0].note).toBe(note);
  await page.getByLabel("اللغة", { exact: true }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(
    a01.getByLabel("Editorial feedback — A01", { exact: true }),
  ).toHaveValue(note);
  await page
    .getByRole("link", { name: "Umrah jurisprudence FAQ", exact: true })
    .click();
  await expect(page.locator("[data-faq-id]")).toHaveCount(16);
  for (const record of reviewRecords.filter((r) => r.id.startsWith("FAQ"))) {
    const card = page.locator(`[data-faq-id="${record.id}"]`);
    await expect(
      card.getByText(record.summaryAr, { exact: true }).first(),
    ).toBeVisible();
    await card.getByText("Explanation and context", { exact: true }).click();
    await expect(
      card.locator(':scope > details').getByText(record.detailsAr!, { exact: true }),
    ).toBeVisible();
  }
  const faq02 = page.locator('[data-faq-id="FAQ02"]');
  await faq02
    .getByRole("button", {
      name: "Evidence and review methodology",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog").getByText(/R4/).first()).toBeVisible();
  await expect(page.locator("dialog blockquote")).toHaveCount(0);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", {
      name: "I understand — show editorial drafts",
      exact: true,
    })
    .click();
  await expect(page.locator("[data-faq-id]")).toHaveCount(16);
  await page
    .getByRole("link", { name: "Umrah guide draft", exact: true })
    .click();
  const restored = page.locator('[data-record-id="A01"]');
  await restored.locator(".review-feedback > summary").click();
  await expect(
    restored.getByLabel("Editorial feedback — A01", { exact: true }),
  ).toHaveValue(note);
  await expect(
    restored.getByLabel("Reviewer name — A01", { exact: true }),
  ).toHaveValue("اسم أدخله المراجع في الاختبار");
  const allDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export feedback as CSV", exact: true })
    .click();
  const csv = readFileSync((await (await allDownload).path())!, "utf8");
  expect(csv).toContain("FAQ16");
  expect(csv).toContain("DUA-Q2-201");
  expect(csv).toContain("NOT GRANTED BY FEEDBACK");
  await page.getByLabel("Reader view", { exact: true }).selectOption("records");
  await page.getByLabel("Record", { exact: true }).selectOption("DUA-Q2-201");
  await expect(
    page.getByText("Exact text awaiting verification", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 375, height: 850 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/review-v2-private-375.png",
    fullPage: true,
  });
  expect(remote).toEqual([]);
});
