import { PromptForm } from "@/components/prompts/prompt-form";
import { PrismaPromptRepository } from "@/infra/repository/prisma-prompt.repository";
import { prisma } from "@/lib/prisma";

type EditPromptProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPrompt({ params }: EditPromptProps) {
  const { id } = await params;
  const repository = new PrismaPromptRepository(prisma);
  const prompt = await repository.findById(id);

  return <PromptForm prompt={prompt} />;
}
