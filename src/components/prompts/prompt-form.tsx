"use client";

import {
  CreatePromptDTO,
  createPromptSchema,
} from "@/core/application/prompts/create-prompt.dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Field, FieldContent } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export const PromptForm = () => {
  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = (data: CreatePromptDTO) => {
    console.log(data);
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
