"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import React from "react";
import Link from "next/link";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Sidebar de Navegação (Menu Lateral) - APENAS para ADMIN */}
      {isAdmin && (
        <aside className="fixed inset-y-0 left-0 z-10 w-60 flex-col border-r bg-background flex">
          <nav className="flex flex-col gap-2 p-4">
            <Link href="/admin/dashboard" className="text-neutral-900 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300">
              Dashboard Admin
            </Link>
            <Link href="/admin/graficos" className="text-neutral-900 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300">
              Gráficos das Salas
            </Link>
          </nav>
        </aside>
      )}

      {/* Conteúdo Principal - Ajusta padding baseado no role */}
      <div className={`flex flex-col gap-4 py-4 ${isAdmin ? 'pl-64' : 'pl-0'}`}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                  <AvatarImage src="/avatar-placeholder.svg" alt="Avatar" />
                  <AvatarFallback />
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 px-6 pb-6 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
