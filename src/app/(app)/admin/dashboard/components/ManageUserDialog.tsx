"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createUserForSala, updateUserForSala, deleteUserForSala } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Settings } from "lucide-react";

const createSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "É necessário criar uma senha." }),
});

const updateSchema = z
  .object({
    email: z.string().email({ message: "Por favor, insira um email válido." }).optional(),
    password: z.string().min(6, { message: "Mínimo de 6 caracteres." }).optional(),
  })
  .refine((data) => !!data.email || !!data.password, { message: "Informe email e/ou senha." });

type Sala = {
  meterId: number;
  user: { email: string } | null;
};

type ApiErrorData = { message?: string | string[] } | unknown;

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data: ApiErrorData = err.response?.data as unknown;
    if (data && typeof data === "object") {
      const maybeMsg = (data as { message?: unknown }).message;
      if (typeof maybeMsg === "string") return maybeMsg;
      if (Array.isArray(maybeMsg) && maybeMsg.length > 0) return String(maybeMsg[0]);
    }
    return err.message || "Erro na operação.";
  }
  return "Erro na operação.";
}

export function ManageUserDialog({ sala }: { sala: Sala }) {
  const [open, setOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: "", password: "" },
  });

  const updateForm = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: { email: sala.user?.email ?? "", password: "" },
  });

  const persistPassword = (password?: string) => {
    if (typeof window !== "undefined" && password) {
      localStorage.setItem(`last_password_${sala.meterId}`, password);
    }
  };

  const createMutation = useMutation({
    mutationFn: createUserForSala,
    onSuccess: (data: { message: string; newPassword?: string }) => {
      // Invalida e refaz a query para atualizar o dashboard
      queryClient.invalidateQueries({ queryKey: ["adminSalas"] });
      queryClient.refetchQueries({ queryKey: ["adminSalas"] });
      setGenericError(null);
      if (data.newPassword) persistPassword(data.newPassword);
      setResultMessage(
        data.newPassword ? `Usuário criado. Senha: ${data.newPassword}` : data.message
      );
      toast.success("Usuário criado com sucesso.");
      createForm.reset();
    },
    onError: (err) => {
      const full = extractErrorMessage(err);
      const msg = full.toLowerCase();
      if (msg.includes("já está em uso") || msg.includes("email")) {
        createForm.setError("email", { message: "Este email já está em uso." });
      } else {
        setGenericError(full);
      }
      toast.error(full);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUserForSala,
    onSuccess: (data: { message: string }) => {
      // Invalida e refaz a query para atualizar o dashboard
      queryClient.invalidateQueries({ queryKey: ["adminSalas"] });
      queryClient.refetchQueries({ queryKey: ["adminSalas"] });
      setGenericError(null);
      const pwd = updateForm.getValues().password;
      if (pwd) persistPassword(pwd);
      setResultMessage(data.message);
      toast.success("Dados do usuário atualizados.");
    },
    onError: (err) => {
      const full = extractErrorMessage(err);
      const msg = full.toLowerCase();
      if (msg.includes("já está em uso") || msg.includes("email")) {
        updateForm.setError("email", { message: "Este email já está em uso." });
      } else {
        setGenericError(full);
      }
      toast.error(full);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserForSala,
    onSuccess: (data: { message: string }) => {
      // Invalida e refaz a query para atualizar o dashboard
      queryClient.invalidateQueries({ queryKey: ["adminSalas"] });
      queryClient.refetchQueries({ queryKey: ["adminSalas"] });
      setResultMessage(data.message);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`last_password_${sala.meterId}`);
      }
      toast.success("Usuário excluído.");
    },
    onError: (err) => {
      const full = extractErrorMessage(err);
      setGenericError(full);
      toast.error(full);
    },
  });

  function onCreate(values: z.infer<typeof createSchema>) {
    setGenericError(null);
    createMutation.mutate({ meterId: sala.meterId, email: values.email, password: values.password });
  }

  function onUpdate(values: z.infer<typeof updateSchema>) {
    setGenericError(null);
    updateMutation.mutate({
      meterId: sala.meterId,
      email: values.email || undefined,
      password: values.password || undefined,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        setResultMessage(null);
        setGenericError(null);
        if (isOpen) {
          createForm.reset({ email: "", password: "" });
          updateForm.reset({ email: sala.user?.email ?? "", password: "" });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Gerenciar Usuário"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Usuário da Sala {sala.meterId}</DialogTitle>
          <DialogDescription>
            {sala.user ? `Usuário atual: ${sala.user.email}` : "Esta sala ainda não possui um usuário."}
          </DialogDescription>
        </DialogHeader>

        {resultMessage ? (
          <div className="space-y-4">
            <p className="text-green-600">{resultMessage}</p>
            <Button onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        ) : sala.user ? (
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdate)} className="space-y-4">
              {genericError && <p className="text-sm text-red-600">{genericError}</p>}
              <FormField
                control={updateForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novo Email (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="novo.email@dominio.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha (opcional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button type="button" variant="outline" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate({ meterId: sala.meterId })}>
                  {deleteMutation.isPending ? "Excluindo..." : "Excluir Usuário"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              {genericError && <p className="text-sm text-red-600">{genericError}</p>}
              {(createForm.formState.errors.email || createForm.formState.errors.password) && (
                <div className="rounded bg-red-100 text-red-800 px-3 py-2 text-sm">
                  {createForm.formState.errors.email?.message || createForm.formState.errors.password?.message}
                </div>
              )}
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="dono.sala@dominio.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
