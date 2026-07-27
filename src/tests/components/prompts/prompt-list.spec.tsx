import { PromptList, PromptListProps } from "@/components/prompts/prompt-list";
import { PromptSummary } from "@/core/domain/prompts/prompt.entity";
import { render, screen } from "@/lib/test-utils";

const makeSut = ({ prompts }: PromptListProps) => {
  return render(<PromptList prompts={prompts} />);
};
describe("PromptList", () => {
  it("deveria renderizar a lista com os prompts", () => {
    const prompts: PromptSummary[] = [
      { id: "1", content: "x", title: "a" },
      { id: "2", content: "y", title: "b" },
    ];
    makeSut({ prompts });

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("não deveria renderizar a lista quando não houver prompts", () => {
    const prompts: PromptSummary[] = [];
    makeSut({ prompts });

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
