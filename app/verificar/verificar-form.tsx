"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function VerificarForm() {
  const [codigo, setCodigo] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo.trim()) {
      router.push(`/verificar/${codigo.trim().toUpperCase()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="EDU-XXXX-XXXX-XXXX"
        className="text-center font-mono"
      />
      <Button type="submit" disabled={!codigo.trim()}>
        <Search className="mr-2 h-4 w-4" />
        Verificar
      </Button>
    </form>
  );
}
