// Rota /admin — redireciona diretamente para a listagem de pedidos (página padrão do painel)
import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/admin/orders");
}
