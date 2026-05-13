// POST /api/admin/upload — upload seguro de imagem para Vercel Blob
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";
import { getAdminFromCookies } from "@/lib/auth";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function detectMimeFromBytes(buffer: Uint8Array): string | null {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return "image/webp";
  return null;
}

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function POST(req: Request) {
  if (!(await getAdminFromCookies())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Tipo não permitido. Use JPG, PNG ou WebP." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo: 2 MB." }, { status: 400 });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  const detectedMime = detectMimeFromBytes(buffer);
  if (!detectedMime || !ALLOWED_TYPES.has(detectedMime)) {
    return NextResponse.json({ error: "Conteúdo do arquivo não é uma imagem válida." }, { status: 400 });
  }

  try {
    const ext = EXT_MAP[detectedMime];
    const filename = `pq/images/${crypto.randomUUID()}${ext}`;

    const blob = await put(filename, Buffer.from(buffer), {
      access: "public",
      addRandomSuffix: false,
      contentType: detectedMime,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro ao fazer upload da imagem" }, { status: 500 });
  }
}
