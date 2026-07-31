import {
  createPromptAction,
  deletePromptAction,
  searchPromptAction,
  updatePromptAction,
} from "@/app/actions/prompt.actions";
import { PromptSummary } from "@/core/domain/prompts/prompt.entity";

jest.mock("@/lib/prisma", () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();
const mockedUpdateExecute = jest.fn();
const mockedDeleteExecute = jest.fn();

jest.mock("@/core/application/prompts/search-prompts.use-case", () => ({
  SearchPromptsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedSearchExecute })),
}));

jest.mock("@/core/application/prompts/create-prompt.use-case", () => ({
  CreatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedCreateExecute })),
}));

jest.mock("@/core/application/prompts/update-prompt.use-case", () => ({
  UpdatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedUpdateExecute })),
}));

jest.mock("@/core/application/prompts/delete-prompt.use-case", () => ({
  DeletePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedDeleteExecute })),
}));

describe("Server Actions: Prompts", () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
    mockedUpdateExecute.mockReset();
    mockedDeleteExecute.mockReset();
  });

  describe("createPromptAction", () => {
    it("deve criar um prompt com sucesso", async () => {
      const data = { title: "title", content: "content" };

      const result = await createPromptAction(data);

      expect(result?.success).toBeTruthy();
      expect(result?.message).toBe("Prompt criado com sucesso!");
    });

    it("deve retornar erro de validação quando os campos forem vazios", async () => {
      const data = { title: "", content: "" };

      const result = await createPromptAction(data);

      expect(result?.success).toBeFalsy();
      expect(result?.message).toBe("Erro de validação");
      expect(result?.errors).toBeDefined();
    });

    it("deve retornar um erro quando PROMPT_ALREADY_EXISTS acontecer", async () => {
      mockedCreateExecute.mockRejectedValue(new Error("PROMPT_ALREADY_EXISTS"));

      const data = { title: "duplicado", content: "duplicado" };

      const result = await createPromptAction(data);
      expect(result?.success).toBeFalsy();
      expect(result?.message).toBe("Este prompt já existe");
    });

    it("deve retornar erro genérico quando a criação falhar", async () => {
      mockedCreateExecute.mockRejectedValue(new Error("UNKNOWN"));
      const data = { title: "Title", content: "Content" };

      const result = await createPromptAction(data);
      expect(result?.success).toBeFalsy();
      expect(result?.message).toBe("Falha ao criar o prompt");
    });
  });

  describe("UpdatePromptAction", () => {
    mockedUpdateExecute.mockResolvedValue({});
    it("deve atualizar com sucesso", async () => {
      const promptId = "1";
      const data = { id: promptId, title: "new title", content: "new content" };

      const result = await updatePromptAction(data);
      expect(result).toMatchObject({
        success: true,
        message: "Prompt atualizado com sucesso",
      });
    });

    it("deve retornar erro de validação quando os campos faltarem", async () => {
      const data = { id: "", title: "", content: "" };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Erro de validação");
      expect(result.errors).toBeDefined();
    });

    it("deve retornar erro quando o prompt não existir", async () => {
      mockedUpdateExecute.mockRejectedValue(new Error("PROMPT_NOT_FOUND"));
      const promptId = "1";
      const data = { id: promptId, title: "new title", content: "new content" };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Prompt não encontrado");
    });

    it("deve retornar o erro genérico quando falhar ao atualizar", async () => {
      mockedUpdateExecute.mockRejectedValue(new Error("unknown"));
      const promptId = "1";
      const data = { id: promptId, title: "new title", content: "new content" };
      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Falha ao atualizar o prompt");
    });
  });

  describe.only("deletePromptAction", () => {
    it("deve remover com sucesso", async () => {
      mockedDeleteExecute.mockResolvedValue(undefined);
      const promptId = "1";
      const result = await deletePromptAction(promptId);

      expect(result.success).toBeTruthy();
      expect(result.message).toBe("Prompt removido com sucesso");
    });

    it("deve retornar erro quando o id for vazio", async () => {
      const promptId = "";
      const result = await deletePromptAction(promptId);

      expect(result.success).toBeFalsy();
      expect(result.message).toBe("Id do prompt é obrigatório");
    });

    it("deve retornar erro quando o prompt não existir", async () => {
      mockedDeleteExecute.mockRejectedValue(new Error("PROMPT_NOT_FOUND"));
      const promptId = "1";
      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Prompt não encontrado");
    });

    it("deve retornar erro genérico quando a action falhar", async () => {
      mockedDeleteExecute.mockRejectedValue(new Error("unknown"));

      const promptId = "1";
      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Falha ao remover o prompt");
    });
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
