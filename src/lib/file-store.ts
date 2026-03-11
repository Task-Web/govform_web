import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import { FileMetadata } from "./types";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // ignore
  }
}

function userDir(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(UPLOADS_DIR, safe);
}

export const fileStore = {
  async saveUpload(file: File, userId: string): Promise<FileMetadata> {
    const dir = userDir(userId);
    await ensureDir(dir);

    const id = uuidv4();
    const ext = path.extname(file.name);
    const storedName = `${id}__${file.name}`;
    const filePath = path.join(dir, storedName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return {
      id,
      name: file.name,
      filename: storedName,
      size: file.size,
      type: mime.lookup(ext) || "application/octet-stream",
      url: `/api/files/${storedName}`,
      uploaded_at: new Date().toISOString(),
    };
  },

  async listFiles(userId: string): Promise<FileMetadata[]> {
    const dir = userDir(userId);
    try {
      const files = await fs.readdir(dir);
      return files.map((filename) => {
        const [id, ...nameParts] = filename.split("__");
        const originalName = nameParts.join("__");
        const ext = path.extname(originalName);
        return {
          id,
          name: originalName,
          filename,
          size: 0,
          type: mime.lookup(ext) || "application/octet-stream",
          url: `/api/files/${filename}`,
        };
      });
    } catch {
      return [];
    }
  },

  async getFilePath(filename: string, userId: string): Promise<string | null> {
    const dir = userDir(userId);
    const filePath = path.join(dir, filename);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(dir))) {
      return null;
    }
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      return null;
    }
  },

  async deleteUserFiles(userId: string): Promise<void> {
    const dir = userDir(userId);
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  },
};
