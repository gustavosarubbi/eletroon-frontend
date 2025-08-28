"use client";

import * as React from "react";
import { Button } from "../../../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../../../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../../components/ui/form";
import { Input } from "../../../../../components/ui/input";
import { createUserForSala, updateUserForSala, deleteUserForSala } from "../../../../../lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Settings, Loader2, UserPlus, User, Trash2, CheckCircle, AlertCircle, X } from "lucide-react";

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
      toast.success("Usuário criado com sucesso!");
      createForm.reset();
      
      // Atualiza a página após 2 segundos para mostrar as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
      toast.success("Dados do usuário atualizados com sucesso!");
      
      // Atualiza a página após 2 segundos para mostrar as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
      toast.success("Usuário excluído com sucesso!");
      
      // Atualiza a página após 2 segundos para mostrar as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
          className="h-10 w-10 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300 smooth-transition-fast shadow-md hover:shadow-lg"
          title="Gerenciar Usuário"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 max-w-md relative">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute -top-3 -right-3 h-10 w-10 inline-flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 hover:text-white smooth-transition-fast focus-ring border-2 border-white shadow-xl z-20 hover:scale-110"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
        <DialogHeader>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <DialogTitle className="text-green-900">Gerenciar Usuário da Sala #{sala.meterId}</DialogTitle>
            <DialogDescription className="text-green-700 mt-2">
              {sala.user ? "Atualize os dados do usuário ou exclua-o da sala." : "Crie um novo usuário para esta sala."}
            </DialogDescription>
          </div>
        </DialogHeader>

        {resultMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">{resultMessage}</p>
          </div>
        )}

        {genericError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{genericError}</p>
          </div>
        )}

        {sala.user ? (
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdate)} className="space-y-6">
              <FormField
                control={updateForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novo Email (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="novo.email@dominio.com" 
                        className="text-base" 
                        {...field} 
                      />
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
                      <Input 
                        type="password" 
                        placeholder="Mínimo 6 caracteres" 
                        className="text-base" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex-col sm:flex-row gap-3">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                                          <>
                        <User className="h-4 w-4" />
                        Salvar Alterações
                      </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={deleteMutation.isPending} 
                  onClick={() => deleteMutation.mutate({ meterId: sala.meterId })} 
                  className="flex items-center gap-2 w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Excluir Usuário
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-6">
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Usuário</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="dono.sala@dominio.com" 
                        className="text-base" 
                        {...field} 
                      />
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
                      <Input 
                        type="password" 
                        placeholder="Mínimo 6 caracteres" 
                        className="text-base" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 w-full"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Criar Usuário
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
