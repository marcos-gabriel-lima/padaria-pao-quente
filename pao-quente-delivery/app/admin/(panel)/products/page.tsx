"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Plus, Star, Upload, Link, Loader2 } from "lucide-react";
import { CATEGORIES, type Product } from "@/db/schema";
import { formatBRL } from "@/lib/money";

type Availability = "available" | "unavailable" | "unlimited";

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  availability: Availability;
  stock: string;
  featured: boolean;
};

const empty: FormState = {
  name: "",
  description: "",
  price: "",
  category: CATEGORIES[0],
  imageUrl: "",
  availability: "unlimited",
  stock: "0",
  featured: false,
};

function isSafeImageUrl(url: string): boolean {
  if (!url) return false;
  try { return new URL(url).protocol === "https:"; } catch { return false; }
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterAvailable, setFilterAvailable] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("");

  const filtered = useMemo(() => {
    let list = [...items];
    if (filterCategory) list = list.filter((p) => p.category === filterCategory);
    if (filterAvailable === "available") list = list.filter((p) => p.availability === "available");
    if (filterAvailable === "unavailable") list = list.filter((p) => p.availability === "unavailable");
    if (filterAvailable === "unlimited") list = list.filter((p) => p.availability === "unlimited");
    if (filterFeatured === "yes") list = list.filter((p) => p.featured);
    if (filterFeatured === "no") list = list.filter((p) => !p.featured);
    list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return list;
  }, [items, filterCategory, filterAvailable, filterFeatured]);

  async function load() {
    const res = await fetch("/api/admin/products");
    setItems(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: p.category,
      imageUrl: p.imageUrl,
      availability: p.availability,
      stock: String(p.stock),
      featured: p.featured,
    });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (form.imageUrl && !isSafeImageUrl(form.imageUrl)) {
      setSaveError("URL da imagem deve usar protocolo https://");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSaveError(data.error || "Erro ao salvar produto");
      setSaving(false);
      return;
    }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function remove(p: Product) {
    if (!confirm(`Excluir "${p.name}"?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    load();
  }

  async function toggleFeatured(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !p.featured }),
    });
    load();
  }

  async function changeAvailability(p: Product, value: Availability, stock?: number) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability: value, ...(stock !== undefined ? { stock } : {}) }),
    });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-coffee-800">Produtos</h2>
        <button onClick={openNew} className="btn-primary">
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="input w-auto"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={filterAvailable}
          onChange={(e) => setFilterAvailable(e.target.value)}
        >
          <option value="">Disponibilidade</option>
          <option value="available">Disponível</option>
          <option value="unavailable">Indisponível</option>
          <option value="unlimited">Ilimitado</option>
        </select>
        <select
          className="input w-auto"
          value={filterFeatured}
          onChange={(e) => setFilterFeatured(e.target.value)}
        >
          <option value="">Oferta do dia</option>
          <option value="yes">Destaque</option>
          <option value="no">Sem destaque</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-coffee-100">
        <table className="w-full text-sm">
          <thead className="bg-coffee-50 text-left text-coffee-700">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Disponível</th>
              <th className="px-4 py-3">Oferta do dia</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-coffee-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-coffee-100">
                      {isSafeImageUrl(p.imageUrl) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-coffee-800">{p.name}</p>
                      <p className="line-clamp-1 max-w-sm text-xs text-coffee-500">{p.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-coffee-700">{p.category}</td>
                <td className="px-4 py-3 font-semibold text-coffee-800">{formatBRL(p.price)}</td>
                <td className="px-4 py-3">
                  <AvailabilityControl product={p} onChange={changeAvailability} />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleFeatured(p)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      p.featured ? "bg-amber-100 text-amber-800" : "bg-coffee-50 text-coffee-500"
                    }`}
                  >
                    <Star className="h-3 w-3" />
                    {p.featured ? "Destaque" : "Marcar"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="rounded p-2 text-coffee-600 hover:bg-coffee-50">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(p)} className="rounded p-2 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-coffee-500">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
          <form onSubmit={save} className="card w-full max-w-lg space-y-3 p-6">
            <h3 className="font-display text-xl text-coffee-800">{editing ? "Editar produto" : "Novo produto"}</h3>
            <div>
              <label className="label">Nome</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea
                className="input"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Preço (R$)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Categoria</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ImageField
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Disponibilidade</label>
                <select
                  className="input"
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value as Availability })}
                >
                  <option value="unlimited">Ilimitado</option>
                  <option value="available">Disponível (com estoque)</option>
                  <option value="unavailable">Indisponível</option>
                </select>
              </div>
              {form.availability === "available" && (
                <div>
                  <label className="label">Quantidade em estoque</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-coffee-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Oferta do dia
            </label>
            {saveError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setSaveError(null); }} className="btn-outline">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [mode, setMode] = useState<"upload" | "url">(value && value.startsWith("http") ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");
      onChange(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <label className="label mb-0">Imagem</label>
        <div className="flex rounded-lg border border-coffee-200 text-xs">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1 rounded-l-lg px-2 py-1 font-semibold transition ${
              mode === "upload" ? "bg-coffee-600 text-white" : "text-coffee-600 hover:bg-coffee-50"
            }`}
          >
            <Upload className="h-3 w-3" /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1 rounded-r-lg px-2 py-1 font-semibold transition ${
              mode === "url" ? "bg-coffee-600 text-white" : "text-coffee-600 hover:bg-coffee-50"
            }`}
          >
            <Link className="h-3 w-3" /> URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div className="flex items-center gap-3">
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-coffee-200 px-4 py-3 text-sm font-semibold text-coffee-600 transition hover:border-coffee-400 hover:bg-coffee-50 ${
              uploading ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Enviando..." : "Escolher imagem"}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFile}
            />
          </label>
          {value && (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Preview" className="h-12 w-12 rounded-lg object-cover ring-1 ring-coffee-100" />
              <button type="button" onClick={() => onChange("")} className="text-xs text-red-600 hover:underline">
                remover
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            className="input flex-1"
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value && isSafeImageUrl(value) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="h-10 w-10 rounded-lg object-cover ring-1 ring-coffee-100" />
          )}
        </div>
      )}

      {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
    </div>
  );
}

function AvailabilityControl({
  product: p,
  onChange,
}: {
  product: Product;
  onChange: (p: Product, value: Availability, stock?: number) => void;
}) {
  const [editStock, setEditStock] = useState(false);
  const [stockVal, setStockVal] = useState(String(p.stock));

  const labels: Record<Availability, { text: string; cls: string }> = {
    unlimited: { text: "Ilimitado", cls: "bg-blue-100 text-blue-800" },
    available: { text: `Disponível (${p.stock})`, cls: "bg-green-100 text-green-800" },
    unavailable: { text: "Indisponível", cls: "bg-red-100 text-red-800" },
  };

  const current = labels[p.availability];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <select
          className="rounded-lg border border-coffee-200 bg-white px-2 py-1 text-xs font-semibold"
          value={p.availability}
          onChange={(e) => {
            const val = e.target.value as Availability;
            if (val === "available") {
              setEditStock(true);
              setStockVal(String(p.stock || 1));
            } else {
              onChange(p, val);
            }
          }}
        >
          <option value="unlimited">Ilimitado</option>
          <option value="available">Disponível</option>
          <option value="unavailable">Indisponível</option>
        </select>
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${current.cls}`}>
          {current.text}
        </span>
      </div>
      {(editStock || p.availability === "available") && editStock && (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="1"
            className="w-16 rounded border border-coffee-200 px-2 py-1 text-xs"
            value={stockVal}
            onChange={(e) => setStockVal(e.target.value)}
          />
          <button
            onClick={() => { onChange(p, "available", Number(stockVal)); setEditStock(false); }}
            className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
          >
            OK
          </button>
          <button
            onClick={() => setEditStock(false)}
            className="text-xs text-coffee-500 hover:underline"
          >
            cancelar
          </button>
        </div>
      )}
      {p.availability === "available" && !editStock && (
        <button
          onClick={() => { setEditStock(true); setStockVal(String(p.stock)); }}
          className="text-left text-xs text-coffee-500 hover:underline"
        >
          alterar estoque
        </button>
      )}
    </div>
  );
}
