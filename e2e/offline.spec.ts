import { test, expect } from "@playwright/test";
test("offline hard reload, drafts, checklist, trip reset and backup restore", async ({
  page,
  context,
}) => {
  const remoteRequests: string[] = [];
  context.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4173/"))
      remoteRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "خطة اليوم" })).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.getByRole("link", { name: "دعواتي", exact: true }).click();
  await page.getByRole("button", { name: "دعاء جديد", exact: true }).click();
  const text = "اللهم احفظ أهلي 🌿 ".repeat(80);
  await page.getByLabel("نص الدعاء").fill(text);
  await page.getByRole("link", { name: "يومي", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page.reload();
  await expect(page.getByRole("heading", { name: "خطة اليوم" })).toBeVisible();
  await page.getByLabel("مهمة جديدة").fill("ماء للسفر");
  await page.getByRole("button", { name: "إضافة مهمة" }).click();
  await page.getByRole("checkbox", { name: /ماء للسفر/ }).check();
  await page.getByRole("link", { name: "دعواتي", exact: true }).click();
  await page.getByRole("button", { name: /اللهم احفظ أهلي/ }).click();
  await expect(page.getByLabel("نص الدعاء")).toHaveValue(text);
  await page.getByRole("link", { name: "مناسك العمرة", exact: true }).click();
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("checkbox")).toBeEnabled();
  await page.reload();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await page.getByRole('button',{name:'حالة الأدلة والمراجعة'}).click();
  await expect(page.getByRole('dialog').getByText('S1 · ابن باز — أعمال مناسك العمرة',{exact:true})).toBeVisible();
  await expect(page.locator('dialog blockquote')).toHaveCount(0);
  await page.getByRole('button',{name:'إغلاق',exact:true}).click();
  await page.getByLabel("عرض اختياري").selectOption("women");
  await expect(page.getByText(/تبقى المراحل المشتركة/)).toBeVisible();
  page.once("dialog", (d) => d.accept("رحلة ثانية"));
  await page.getByRole("button", { name: "رحلة جديدة", exact: true }).click();
  await expect(page.getByLabel("الرحلة", { exact: true })).not.toHaveValue(
    "first",
  );
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("checkbox")).toBeEnabled();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "تصفير متابعة الرحلة" }).click();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await page.getByLabel("الرحلة", { exact: true }).selectOption("first");
  await expect(page.getByRole("checkbox")).toBeChecked();
  await page.getByRole("link", { name: "المزيد", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "تصدير نسخة JSON" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "مسح البيانات المحلية" }).click();
  await expect(page.getByText("حُذفت البيانات المحلية")).toBeVisible();
  await page
    .getByLabel("استعادة نسخة (تستبدل البيانات الحالية)")
    .setInputFiles(path!);
  await expect(page.getByText("تمت الاستعادة", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "دعواتي", exact: true }).click();
  await page.getByRole("button", { name: /اللهم احفظ أهلي/ }).click();
  await expect(page.getByLabel("نص الدعاء")).toHaveValue(text);
  await page.close();
  page = await context.newPage();
  await page.goto("/duas");
  await page.getByRole("button", { name: /اللهم احفظ أهلي/ }).click();
  await expect(page.getByLabel("نص الدعاء")).toHaveValue(text);
  expect(remoteRequests).toEqual([]);
});
test("RTL layout has no horizontal overflow at mobile widths", async ({
  page,
}) => {
  for (const width of [320, 375, 430]) {
    await page.setViewportSize({ width, height: 850 });
    for (const path of ["/", "/duas", "/umrah", "/more"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      if (path === "/")
        await page.screenshot({
          path: `test-results/zaad-day-${width}.png`,
          fullPage: true,
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.screenshot({
      path: `test-results/zaad-${width}.png`,
      fullPage: true,
    });
  }
});
