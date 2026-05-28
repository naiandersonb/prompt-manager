"use client";

import { createPromptAction } from "@/app/actions/prompt.actions";
import { Button } from "@/components/ui/button";
import { Field, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CreatePromptDTO,
  createPromptSchema,
} from "@/core/application/prompts/create-prompt.dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export const PromptForm = () => {
  const router = useRouter();
  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: CreatePromptDTO) => {
    const result = await createPromptAction(data);
    console.log("Submit", result);

    if (!result.success) {
      toast.error(result.message);
    }

    toast.success(result.message);
    router.refresh();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
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
                className="text-2xl! py-6"
                placeholder="Título do prompt"
                autoFocus
                {...field}
              />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="content"
        render={({ field }) => (
          <Field
            orientation="responsive"
            data-invalid={!!form.formState.errors.title}
          >
            <FieldContent>
              <Textarea
                placeholder="Digite o conteúdo do prompt..."
                {...field}
              />
            </FieldContent>
          </Field>
        )}
      />
    </form>
  );
};
