import {
  SidebarContent,
  SidebarContentProps,
} from "@/components/sidebar/sidebar-content";
import { PromptSummary } from "@/core/domain/prompts/prompt.entity";
import { render, screen } from "@/lib/test-utils";
import userEvent from "@testing-library/user-event";

const pushMock = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => mockSearchParams,
}));

const initialPrompts: PromptSummary[] = [
  { id: "1", title: "Prompt 01", content: "Content 01" },
];

const makeSut = (
  { prompts = initialPrompts }: SidebarContentProps = {} as SidebarContentProps,
) => {
  return render(<SidebarContent prompts={prompts} />);
};

describe("SidebarContent", () => {
  const user = userEvent.setup();

  describe("Base", () => {
    it("Deveria renderizar o botão para criar um novo prompt", () => {
      makeSut();

      expect(screen.getByRole("complementary")).toBeVisible();
      expect(screen.getByRole("button", { name: "Novo prompt" })).toBeVisible();
    });

    it("deveria renderizar a lista de prompts", () => {
      const prompts = [
        { id: "1", title: "Prompt 01", content: "Content 01" },
        { id: "2", title: "Prompt 02", content: "Content 02" },
      ];
      makeSut({ prompts });
      expect(screen.getByText(prompts[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole("paragraph")).toHaveLength(prompts.length);
    });

    it("deveria atualizar o campo de busca ao digitar", async () => {
      const text = "AI para desenvolvimento front-end";
      makeSut();
      const searchInput = screen.getByPlaceholderText("Buscar prompts...");

      await user.type(searchInput, text);
      expect(searchInput).toHaveValue(text);
    });
  });

  describe("Colapsar/expandir", () => {
    it("deveria iniciar expandida e exibir o botão minimizar", () => {
      makeSut();
      const aside = screen.getByRole("complementary");
      expect(aside).toBeVisible();

      const collapseButton = screen.getByRole("button", {
        name: /minimizar sidebar/i,
      });

      expect(collapseButton).toBeVisible();

      const expandButton = screen.queryByRole("button", {
        name: /expandir sidebar/i,
      });
      expect(expandButton).not.toBeInTheDocument();
    });

    it("deveria contrair e mostrar o botão expandir", async () => {
      makeSut();

      const collapseButton = screen.getByRole("button", {
        name: /minimizar sidebar/i,
      });

      await user.click(collapseButton);

      const expandButton = screen.queryByRole("button", {
        name: /expandir sidebar/i,
      });

      expect(expandButton).toBeInTheDocument();
      expect(collapseButton).not.toBeInTheDocument();
    });

    it("deveria exibir o botão de criar um novo prompt na sidebar minimizada", async () => {
      makeSut();
      const collapseButton = screen.getByRole("button", {
        name: /minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const newPromptButton = screen.getByRole("button", {
        name: /novo prompt/i,
      });
      expect(newPromptButton).toBeVisible();
    });

    it("não deveria exibir a lista de prompts na sidebar minimizada", async () => {
      makeSut();

      const collapseButton = screen.getByRole("button", {
        name: /minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const nav = screen.queryByRole("navigation", {
        name: /lista de prompts/i,
      });

      expect(nav).not.toBeInTheDocument();
    });
  });

  describe("Novo prompt", () => {
    it("deveria navegar o usuário para a página de novo prompt /new", async () => {
      makeSut();
      const newButton = screen.getByRole("button", { name: "Novo prompt" });
      await user.click(newButton);
      expect(pushMock).toHaveBeenCalledWith("/new");
    });
  });

  describe("Busca", () => {
    it("deveria navegar com URL condificada ao digitar e limpar", async () => {
      const text = "AI B";
      makeSut();

      const searchInput = screen.getByPlaceholderText("Buscar prompts...");
      await user.type(searchInput, text);
      expect(pushMock).toHaveBeenCalled();
      const lastCall = pushMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe("/?q=AI%20B");

      await user.clear(searchInput);
      const lastClearCall = pushMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe("/");
    });

    it("deveria iniciar o campo de busca com o search param", async () => {
      const text = "initial";
      const searchParams = new URLSearchParams(`q=${text}`);
      mockSearchParams = searchParams;
      makeSut();
      const searchInput = screen.getByPlaceholderText("Buscar prompts...");
      expect(searchInput).toHaveValue(text);
    });
  });
});
