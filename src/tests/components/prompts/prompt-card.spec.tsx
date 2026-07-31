import { PromptCard, PromptCardProps } from "@/components/prompts/prompt-card";
import { render, screen } from "@/lib/test-utils";
import { userEvent } from "@testing-library/user-event";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const deleteMock = jest.fn();
jest.mock("@/app/actions/prompt.actions", () => ({
  deletePromptAction: (id: string) => deleteMock(id),
}));

const makeSut = ({ prompt }: PromptCardProps) => {
  return render(<PromptCard prompt={prompt} />);
};
describe("PromptCard", () => {
  const user = userEvent.setup();
  const prompt = { content: "x", title: "a", id: "1" };
  it("deveria renderizar o link com href corretamente", () => {
    makeSut({ prompt });
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", `/${prompt.id}`);
  });

  it("deveria abrir o dialog de remoção de um prompt", async () => {
    makeSut({ prompt });
    const deleteButton = screen.getByRole("button", { name: "Remover Prompt" });
    await user.click(deleteButton);

    expect(screen.getByText("Remover Prompt")).toBeInTheDocument();
  });

  it("deveria remover com sucesso e exibir o toast", async () => {
    deleteMock.mockResolvedValue({
      success: true,
      message: "Prompt removido com sucesso",
    });
    makeSut({ prompt });
    const deleteButton = screen.getByRole("button", { name: "Remover Prompt" });
    await user.click(deleteButton);

    const confirmDelete = screen.getByRole("button", {
      name: "Confirmar remoção",
    });
    await user.click(confirmDelete);

    expect(toast.success).toHaveBeenCalledWith("Prompt removido com sucesso");
  });

  it("deveria exibir erro quando o action falhar", async () => {
    const errorMessage = "Erro ao remover o prompt";
    deleteMock.mockResolvedValue({
      success: false,
      message: errorMessage,
    });
    makeSut({ prompt });

    const deleteButton = screen.getByRole("button", { name: "Remover Prompt" });
    await user.click(deleteButton);

    const confirmDelete = screen.getByRole("button", {
      name: "Confirmar remoção",
    });
    await user.click(confirmDelete);

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });
});
