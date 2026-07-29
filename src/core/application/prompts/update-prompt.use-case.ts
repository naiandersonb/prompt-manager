import { PromptRepository } from "@/core/domain/prompts/prompt.repository";
import { UpdatePromptDTO } from "./update-prompt.dto";

export class UpdatePromptUseCase {
  constructor(private promptRepository: PromptRepository) {}

  async execute(data: UpdatePromptDTO): Promise<void> {
    const promptExists = await this.promptRepository.findById(data.id);
    if (!promptExists) {
      throw new Error("PROMPT_NOT_FOUND");
    }

    await this.promptRepository.update(data.id, {
      title: data.title,
      content: data.content,
    });
  }
}
