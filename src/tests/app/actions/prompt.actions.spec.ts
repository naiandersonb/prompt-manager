import { searchPromptAction } from "@/app/actions/prompt.actions";
import { PromptSummary } from "@/core/domain/prompts/prompt.entity";

jest.mock("@/lib/prisma", () => ({ prisma: {} }));
const mockedSearchExecute = jest.fn();

jest.mock("@/core/application/prompts/search-prompts.use-case", () => ({
  SearchPromptsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedSearchExecute })),
}));

describe("Server Actions: Prompts", () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
  });
  describe("searchPromptAction", () => {
    it("deve retornar sucesso com o termo de busca não vazio", async () => {
      const input: PromptSummary[] = [
        { id: "1", content: "AI desc", title: "AI title" },
      ];

      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append("q", "AI");

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it("deve retornar sucesso e listar todos os prompts quando o termo for vazio", async () => {
      const input: PromptSummary[] = [
        { id: "01", content: "AI desc 01", title: "AI title 01" },
        { id: "02", content: "AI desc 02", title: "AI title 02" },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append("q", "");

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it("deve retornar um erro genérico quando falhar ao buscar", async () => {
      const error = new Error("generic error");
      mockedSearchExecute.mockRejectedValue(error);
      const formData = new FormData();
      formData.append("q", "qualquer coisa");

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBe(false);
      expect(result.prompts).toBeUndefined();
      expect(result.message).toBe("Falha ao buscar prompts");
    });

    it("deve aparar espaços do termo antes de executar", async () => {
      const input: PromptSummary[] = [
        { id: "01", content: "AI desc 01", title: "AI title 01" },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append("q", "   AI");

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBe(true);
      expect(mockedSearchExecute).toHaveBeenCalledWith("AI");
      expect(result.prompts).toEqual(input);
    });

    it("deve tratar ausência da query como termo vazio", async () => {
      const input: PromptSummary[] = [
        { id: "01", content: "AI desc 01", title: "AI title 01" },
        { id: "02", content: "AI desc 02", title: "AI title 02" },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBe(true);
      expect(mockedSearchExecute).toHaveBeenCalledWith("");
      expect(result.prompts).toEqual(input);
    });
  });
});
