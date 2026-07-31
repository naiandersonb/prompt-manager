import { PrismaClient } from "@/generated/prisma/client";
import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";

test("Deleção de prompt via UI", async ({ page }) => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });
  const uniqueTitle = `E2E Delete Prompt ${Date.now()}`;
  const uniqueContent = "unique content";
  await prisma.prompt.create({
    data: { title: uniqueTitle, content: uniqueContent },
  });
  await prisma.$disconnect();

  page.goto("/");
  const list = page.getByRole("list");
  await expect(list).toBeVisible();

  const heading = page.getByRole("heading", { name: uniqueTitle });
  await expect(heading).toBeVisible({ timeout: 15000 });

  const promptItem = page
    .getByRole("listitem")
    .filter({ hasText: uniqueTitle });
  await expect(promptItem).toBeVisible();

  await promptItem.getByRole("button", { name: "Remover Prompt" }).click();
  await page.getByRole("button", { name: "Confirmar remoção" }).click();

  await expect(page.getByText("Prompt removido com sucesso")).toBeVisible();
  await expect(page.getByRole("heading", { name: uniqueTitle })).toHaveCount(0);
});
