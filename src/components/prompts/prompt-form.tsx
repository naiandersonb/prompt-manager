"use client";

import {
  createPromptAction,
  updatePromptAction,
} from "@/app/actions/prompt.actions";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CreatePromptDTO,
  createPromptSchema,
} from "@/core/application/prompts/create-prompt.dto";
import { Prompt } from "@/core/domain/prompts/prompt.entity";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { CopyButton } from "../button-actions/copy-button";

type PromptFormProps = {
  prompt?: Prompt | null;
};
export const PromptForm = ({ prompt }: PromptFormProps) => {
  const router = useRouter();
  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: prompt?.title || "",
      content: prompt?.content || "",
    },
  });

  const content = useWatch({ control: form.control, name: "content" });

  const isEdit = !!prompt?.id;

  const onSubmit = async (data: CreatePromptDTO) => {
    const result = isEdit
      ? await updatePromptAction({ id: prompt.id, ...data })
      : await createPromptAction(data);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
        <CopyButton content={content} />

        <Button type="submit" size="sm">
          Salvar
        </Button>
      </header>

      <Controller
        control={form.control}
        name="title"
        render={({ field }) => (
          <Field
            orientation="responsive"
            data-invalid={!!form.formState.errors.title}
          >
            <FieldContent>
              <Input
                aria-invalid={!!form.formState.errors.title}
                className="text-2xl! py-6"
                placeholder="Título do prompt"
                autoFocus
                {...field}
              />
            </FieldContent>
            {form.formState.errors.title?.message && (
              <FieldError>{form.formState.errors.title.message}</FieldError>
            )}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="content"
        render={({ field }) => (
          <Field
            orientation="responsive"
            data-invalid={!!form.formState.errors.content}
          >
            <FieldContent>
              <Textarea
                placeholder="Digite o conteúdo do prompt..."
                aria-invalid={!!form.formState.errors.content}
                {...field}
              />
            </FieldContent>
            {form.formState.errors.content?.message && (
              <FieldError>{form.formState.errors.content.message}</FieldError>
            )}
          </Field>
        )}
      />
    </form>
  );
};
