import { SearchPromptsUseCase } from "@/core/application/prompts/search-prompts.use-case";
import { Prompt } from "@/core/domain/prompts/prompt.entity";
import { PromptRepository } from "@/core/domain/prompts/prompt.repository";

describe("SearchPromptUseCase", () => {
  const input: Prompt[] = [
    {
      content: "content 01",
      id: "id-01",
      title: "title 01",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      content: "content 02",
      id: "id-02",
      title: "title 02",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const repository: PromptRepository = {
    findMany: async () => input,
    searchMany: async (term) =>
      input.filter(
        (p) =>
          p.title.toLocaleLowerCase().includes(term?.toLowerCase()) ||
          p.content.toLocaleLowerCase().includes(term?.toLowerCase()),
      ),
  };

  it("deve retornar todos os prompts quando o termo for vazio", async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const result = await useCase.execute("");
    expect(result).toHaveLength(2);
  });

  it("deve filtrar a lista de prompts pelo termo pesquisado", async () => {
    const useCase = new SearchPromptsUseCase(repository);

    const term = "title 02";
    const result = await useCase.execute(term);
    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual("id-02");
  });

  it("deve aplicar trim() em buscas com termo com espaços em branco e retornar toda a lista de prompts", async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);

    const term = "  ";
    const result = await useCase.execute(term);
    expect(result).toHaveLength(2);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });

  it("deve buscar termo com espaços em branco, tratando com trim()", async () => {
    const firstElement = input.slice(0, 1);
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue(firstElement);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const term = "title 02  ";
    const result = await useCase.execute(term);

    expect(result).toMatchObject(firstElement);
    expect(searchMany).toHaveBeenCalledWith(term.trim());
    expect(findMany).not.toHaveBeenCalled();
  });

  it("deve lidar com termo undefined ou null e retornar a lista completa de prompts", async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const term = undefined as unknown as string;
    const result = await useCase.execute(term);
    expect(result).toMatchObject(input);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });
});
