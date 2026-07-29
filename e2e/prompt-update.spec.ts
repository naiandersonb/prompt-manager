import { PrismaClient } from "@/generated/prisma/client";
import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";

test("Edição de prompt via UI", async ({ page }) => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const now = Date.now();
  const originalTitle = `E2E edit original ${now}`;
  const updatedTitle = `E2E edit updated ${now}`;
  const originalContent = `Content original ${now}`;
  const updatedContent = `Content updated ${now}`;

  const create = await prisma.prompt.create({
    data: {
      title: originalTitle,
      content: originalContent,
    },
  });
  await prisma.$disconnect();

  page.goto(`/${create.id}`);
  await expect(page.getByPlaceholder("Título do prompt")).toBeVisible();
  await page.fill('input[name="title"]', updatedTitle);
  await page.fill('textarea[name="content"]', updatedContent);
  await page.getByRole("button", { name: "Salvar" }).click();

  await page.waitForSelector("text=Prompt atualizado com sucesso", {
    state: "visible",
    timeout: 15000,
  });

  await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
  await expect(page.locator('input[name="title"]')).toHaveValue(updatedTitle);
});
