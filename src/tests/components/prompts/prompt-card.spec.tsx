import { PromptCard, PromptCardProps } from "@/components/prompts/prompt-card";
import { render, screen } from "@/lib/test-utils";

const makeSut = ({ prompt }: PromptCardProps) => {
  return render(<PromptCard prompt={prompt} />);
};
describe("PromptCard", () => {
  it("deveria renderizar o link com href corretamente", () => {
    const prompt = { content: "x", title: "a", id: "1" };
    makeSut({ prompt });
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", `/${prompt.id}`);
  });
});
