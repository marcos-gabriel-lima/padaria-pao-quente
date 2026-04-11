"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import { CATEGORIES, type Product } from "@/db/schema";
import { formatBRL } from "@/lib/money";

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  available: boolean;
  featured: boolean;
};

const empty: FormState = {
  name: "",
  description: "",
  price: "",
  category: CATEGORIES[0],
  imageUrl: "",
  available: true,
  featured: false,
};

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

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
      available: p.available,
      featured: p.featured,
    });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
    };
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function remove(p: Product) {
    if (!confirm(`Excluir "${p.name}"?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    load();
  }

  async function toggle(p: Product, field: "available" | "featured") {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !p[field] }),
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
            {items.map((p) => (
              <tr key={p.id} className="border-t border-coffee-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-coffee-100">
                      {p.imageUrl && (
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
                  <Toggle on={p.available} onClick={() => toggle(p, "available")} />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(p, "featured")}
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
            {items.length === 0 && (
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
            <div>
              <label className="label">URL da imagem</label>
              <input
                className="input"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-coffee-700">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                />
                Disponível
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-coffee-700">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Oferta do dia
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
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

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-green-600" : "bg-coffee-300"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}
