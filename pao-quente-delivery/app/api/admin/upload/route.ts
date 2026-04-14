// POST /api/admin/upload — upload seguro de imagem (magic bytes, limite 2MB, max 500 arquivos)
import { NextResponse } from "next/server";
import { writeFile, mkdir, readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import { getAdminFromCookies } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_FILES = 500; // prevent disk flood
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function detectMimeFromBytes(buffer: Uint8Array): string | null {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  // WebP: RIFF....WEBP (bytes 0-3 = RIFF, bytes 8-11 = WEBP)
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

  // Validate declared MIME type
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF." },
      { status: 400 }
    );
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Arquivo muito grande. Máximo: 2 MB." },
      { status: 400 }
    );
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  // Validate magic bytes to prevent disguised files
  const detectedMime = detectMimeFromBytes(buffer);
  if (!detectedMime || !ALLOWED_TYPES.has(detectedMime)) {
    return NextResponse.json(
      { error: "Conteúdo do arquivo não corresponde a uma imagem válida." },
      { status: 400 }
    );
  }

  // Generate safe random filename (no user input in the filename)
  const ext = EXT_MAP[detectedMime] || ".bin";
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Ensure path stays within UPLOAD_DIR (path traversal protection)
  if (!filepath.startsWith(UPLOAD_DIR)) {
    return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
  }

  // Ensure upload dir exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  // Prevent disk flood: limit total number of files
  const existingFiles = (await readdir(UPLOAD_DIR)).filter((f) => f !== ".gitkeep");
  if (existingFiles.length >= MAX_FILES) {
    return NextResponse.json(
      { error: `Limite de ${MAX_FILES} imagens atingido. Exclua imagens antigas antes de enviar novas.` },
      { status: 400 }
    );
  }

  await writeFile(filepath, buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
