"use client";

import { useTransition, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { subirAvatar } from "@/lib/perfil/actions";
import { toast } from "sonner";

export function PerfilAvatarUpload() {
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("avatar", file);

    startTransition(async () => {
      const res = await subirAvatar(formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Avatar actualizado");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/80 transition-colors"
        aria-label="Cambiar foto"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </>
  );
}
