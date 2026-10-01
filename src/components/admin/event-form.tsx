"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Save, ArrowLeft, ImagePlus } from "lucide-react";
import { save } from "@/app/admin/actions";
import { categories, type EventEntry } from "@/lib/event-validation";
function localDate(date: string) {
  if (!date) return "";
  const d = new Date(date);
  return new Date(d.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
}
export function EventForm({ entry }: { entry?: EventEntry }) {
  const [state, action, pending] = useActionState(save, {});
  const [title, setTitle] = useState(entry?.title || "");
  return (
    <form
      action={action}
      className="event-editor"
      onReset={(event) => event.preventDefault()}
    >
      <input type="hidden" name="id" value={entry?.id || ""} />
      <div className="admin-page-heading">
        <div>
          <Link href="/admin" className="text-link">
            <ArrowLeft size={16} />
            Voltar ao painel
          </Link>
          <h1>{entry ? "Editar conteúdo" : "Uma nova ideia começa aqui."}</h1>
          <p>Preencha os detalhes e escolha quando publicar.</p>
        </div>
        <button type="submit" className="button button-dark" disabled={pending}>
          <Save size={17} />
          {pending ? "Salvando…" : "Salvar conteúdo"}
        </button>
      </div>
      {state.error && (
        <div className="form-error" role="alert">
          {state.error}
        </div>
      )}
      <div className="editor-grid">
        <div className="editor-panel">
          <h2>Conteúdo</h2>
          <label>
            Título
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Oficina de confeitaria com…"
              required
              minLength={5}
              maxLength={160}
            />
            <small>{title.length}/160 caracteres</small>
          </label>
          <label>
            Resumo
            <textarea
              name="excerpt"
              defaultValue={entry?.excerpt}
              required
              minLength={15}
              maxLength={320}
              rows={3}
              placeholder="Uma breve apresentação para despertar o interesse de quem visita."
            />
            <small>Aparece no cartão do blog. Até 320 caracteres.</small>
          </label>
          <label>
            Texto completo
            <textarea
              name="body"
              defaultValue={entry?.body}
              required
              minLength={30}
              maxLength={20000}
              rows={13}
              placeholder="Conte o que a pessoa vai aprender, a programação e os detalhes importantes…"
            />
            <small>
              Separe os parágrafos com uma linha em branco. O texto é publicado
              sem HTML.
            </small>
          </label>
          <label className="upload-label">
            <ImagePlus size={20} />
            Imagem de capa
            <input
              type="file"
              name="image"
              accept="image/png,image/jpeg,image/webp"
            />
            <small>
              JPG, PNG ou WebP. Máximo 5 MB. A arte completa aparece na página
              do conteúdo.
            </small>
          </label>
          {entry?.image && (
            <div className="editor-current-image">
              <Image
                src={entry.image}
                alt="Capa atual"
                width={160}
                height={160}
              />
              <span>Capa atual · enviar outra imagem substitui esta.</span>
            </div>
          )}
        </div>
        <div className="editor-sidebar">
          <div className="editor-panel">
            <h2>Publicação</h2>
            <label>
              Categoria
              <select
                name="category"
                defaultValue={entry?.category || "Cursos"}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Visibilidade
              <select name="status" defaultValue={entry?.status || "draft"}>
                <option value="draft">Rascunho — só no painel</option>
                <option value="published">Publicado — visível no site</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="archived"
                defaultChecked={entry?.archived}
              />
              <span>Conteúdo de arquivo</span>
            </label>
            <small>
              Use para conteúdos antigos. Cursos e eventos novos precisam de
              data para serem publicados.
            </small>
          </div>
          <div className="editor-panel">
            <h2>Detalhes do encontro</h2>
            <label>
              Data e horário
              <input
                type="datetime-local"
                name="eventDate"
                defaultValue={localDate(entry?.eventDate || "")}
              />
              <small>Horário de Brasília (UTC−3).</small>
            </label>
            <label>
              Local
              <input
                name="location"
                defaultValue={entry?.location}
                maxLength={160}
                placeholder="Unidade, cidade ou online"
              />
            </label>
            <label>
              Instrutor ou responsável
              <input
                name="instructor"
                defaultValue={entry?.instructor}
                maxLength={120}
                placeholder="Nome de quem conduz o encontro"
              />
            </label>
            <label>
              Link de inscrição
              <input
                type="url"
                name="registrationUrl"
                defaultValue={entry?.registrationUrl}
                maxLength={2000}
                placeholder="https://…"
              />
              <small>
                Sem link, o botão direciona para o WhatsApp. Conteúdos de
                arquivo direcionam para próximas turmas.
              </small>
            </label>
          </div>
          <button
            type="submit"
            className="button button-dark mobile-save"
            disabled={pending}
          >
            {pending ? "Salvando…" : "Salvar conteúdo"}
            <Save size={17} />
          </button>
        </div>
      </div>
    </form>
  );
}
