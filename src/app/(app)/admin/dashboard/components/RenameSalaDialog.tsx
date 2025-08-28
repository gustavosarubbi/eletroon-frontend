"use client";

import * as React from "react";
import { Button } from "../../../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../../../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../../components/ui/form";
import { Input } from "../../../../../components/ui/input";
import { updateSalaName } from "../../../../../lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Edit, Loader2, Save, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
});

type Sala = {
  meterId: number;
  name: string;
};

export function RenameSalaDialog({ sala }: { sala: Sala }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: sala.name },
  });

  const mutation = useMutation({
    mutationFn: updateSalaName,
    onSuccess: () => {
      // Invalida e refaz a query para atualizar o dashboard
      queryClient.invalidateQueries({ queryKey: ["adminSalas"] });
      queryClient.refetchQueries({ queryKey: ["adminSalas"] });
      setOpen(false);
      toast.success("Sala renomeada com sucesso!");
    },
    onError: () => {
      toast.error("Falha ao renomear a sala.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate({ meterId: sala.meterId, name: values.name });
  }

  const handleClose = () => {
    if (!mutation.isPending) {
      setOpen(false);
      form.reset({ name: sala.name });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-300 smooth-transition-fast shadow-md hover:shadow-lg"
          title="Editar Nome da Sala"
        >
          <Edit className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 relative">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute -top-3 -right-3 h-10 w-10 inline-flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 hover:text-white smooth-transition-fast focus-ring border-2 border-white shadow-xl z-20 hover:scale-110"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
        <DialogHeader>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <DialogTitle className="text-blue-900">Editar Sala #{sala.meterId}</DialogTitle>
            <DialogDescription className="text-blue-700 mt-2">
              Altere o nome da sala para melhor identificação. O nome deve ter pelo menos 3 caracteres.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Sala</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Sala Principal, Laboratório 1, Auditório" 
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
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="flex items-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
