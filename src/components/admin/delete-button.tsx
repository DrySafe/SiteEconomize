"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { remove } from "@/app/admin/actions";
export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  return confirm ? (
    <div className="delete-confirm">
      <span>Excluir este conteúdo?</span>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const form = new FormData();
            form.set("id", id);
            await remove(form);
            setConfirm(false);
          })
        }
      >
        {pending ? "Excluindo…" : "Sim, excluir"}
      </button>
      <button onClick={() => setConfirm(false)} disabled={pending}>
        Cancelar
      </button>
    </div>
  ) : (
    <button
      className="icon-button danger"
      aria-label={`Excluir ${title}`}
      onClick={() => setConfirm(true)}
    >
      <Trash2 size={17} />
    </button>
  );
}
