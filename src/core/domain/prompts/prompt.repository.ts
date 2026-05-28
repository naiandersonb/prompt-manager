import { CreatePromptDTO } from "@/core/application/prompts/create-prompt.dto";
import { Prompt } from "./prompt.entity";

export interface PromptRepository {
  create(data: CreatePromptDTO): Promise<void>;
  findMany: () => Promise<Prompt[]>;
  searchMany: (term: string) => Promise<Prompt[]>;
  findByTitle(title: string): Promise<Prompt | null>;
}
