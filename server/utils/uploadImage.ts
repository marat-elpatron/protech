import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_BYTES = 5 * 1024 * 1024;

type UploadPart = {
  data?: Buffer;
  type?: string;
  filename?: string;
};

export async function saveUploadedImage(file: UploadPart): Promise<string> {
  if (!file.data?.length) {
    throw createError({ statusCode: 400, message: "Файл пуст" });
  }

  if (file.data.length > MAX_BYTES) {
    throw createError({
      statusCode: 400,
      message: "Файл слишком большой. Максимум — 5 МБ",
    });
  }

  const mime = file.type?.toLowerCase() ?? "";
  if (!ALLOWED_MIME.has(mime)) {
    throw createError({
      statusCode: 400,
      message: "Допустимы только JPEG, PNG, WebP и GIF",
    });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext =
    EXT_BY_MIME[mime] ||
    extname(file.filename ?? "").toLowerCase() ||
    ".jpg";
  const filename = `${randomUUID()}${ext}`;
  await writeFile(join(UPLOAD_DIR, filename), file.data);

  return `/uploads/${filename}`;
}
