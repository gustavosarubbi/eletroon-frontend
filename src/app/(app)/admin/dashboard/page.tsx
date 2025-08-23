"use client";

export const dynamic = "force-dynamic";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminSalas, deleteDevice } from "@/lib/api";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RenameSalaDialog } from "./components/RenameSalaDialog";
import { ManageUserDialog } from "./components/ManageUserDialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Tipo esperado da API
type Sala = {
  meterId: number;
  name: string;
  status: "ONLINE" | "OFFLINE";
  lastReadingAt: string | null;
  user: { email: string } | null;
};

function SalaRow({ sala }: { sala: Sala }) {
  const [lastPwd, setLastPwd] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      const v = localStorage.getItem(`last_password_${sala.meterId}`);
      setLastPwd(v);
    } catch {}
  }, [sala.meterId]);

  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      // Invalida e refaz a query para atualizar o dashboard
      queryClient.invalidateQueries({ queryKey: ["adminSalas"] });
      queryClient.refetchQueries({ queryKey: ["adminSalas"] });
      toast.success("Medidor excluído.");
    },
    onError: () => toast.error("Falha ao excluir o medidor."),
  });

  const onDelete = () => {
    if (confirm(`Tem certeza que deseja excluir o medidor ${sala.meterId}? Esta ação é irreversível.`)) {
      deleteMutation.mutate({ meterId: sala.meterId });
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{sala.meterId}</TableCell>
      <TableCell>{sala.name}</TableCell>
      <TableCell>
        <Badge variant={sala.status === "ONLINE" ? "default" : "destructive"}>{sala.status}</Badge>
      </TableCell>
      <TableCell>{sala.lastReadingAt ? new Date(sala.lastReadingAt).toLocaleString("pt-BR") : "N/A"}</TableCell>
      <TableCell>{sala.user?.email ?? "—"}</TableCell>
      <TableCell>
        {lastPwd ? (show ? lastPwd : "••••••") : "—"}
        {lastPwd && (
          <button className="ml-2 text-sm underline" onClick={() => setShow(!show)}>
            {show ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center gap-2 justify-end">
          <RenameSalaDialog sala={{ meterId: sala.meterId, name: sala.name }} />
          <ManageUserDialog sala={{ meterId: sala.meterId, user: sala.user }} />
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            disabled={deleteMutation.isPending}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Excluir Medidor"
          >
            {deleteMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminDashboardPage() {
  const { data: salas, isLoading, isError } = useQuery<Sala[]>({
    queryKey: ["adminSalas"],
    queryFn: getAdminSalas,
    retry: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  });

  if (isLoading) {
    return <div className="p-4">Carregando salas...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Ocorreu um erro ao buscar os dados.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Visão Geral das Salas</h1>
      <Table>
        <TableCaption>Uma lista de todas as salas monitoradas.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Nome da Sala</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última Leitura</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Senha</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salas?.map((sala) => (
            <SalaRow key={sala.meterId} sala={sala} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
