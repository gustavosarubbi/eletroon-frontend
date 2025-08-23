"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [backendDown, setBackendDown] = useState(false);

  useEffect(() => {
    // Sinalização vinda de áreas autenticadas
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem("backend_offline") === "1") {
        setBackendDown(true);
        sessionStorage.removeItem("backend_offline");
      }
    } catch {}

    // Verificação direta no primeiro acesso
    (async () => {
      try {
        await api.get("/docs", { headers: { Accept: "text/html" }, timeout: 3000 });
      } catch {
        setBackendDown(true);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
    } catch (err) {
      setError("Falha no login. Verifique suas credenciais.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-black">Login EletroON</CardTitle>
          <CardDescription className="text-black">
            Entre com seu email e senha para acessar seu dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backendDown && (
            <div className="mb-4 rounded bg-red-100 text-red-800 px-3 py-2 text-sm">
              O sistema está temporariamente indisponível. Tente novamente mais tarde.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-black">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
