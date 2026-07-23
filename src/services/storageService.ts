import { writeFile, unlink, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export class StorageService {
  private static baseDir = join(process.cwd(), 'storage')

  static async ensureDir(subDir: string): Promise<string> {
    const fullPath = join(this.baseDir, subDir)
    if (!existsSync(fullPath)) {
      await mkdir(fullPath, { recursive: true })
    }
    return fullPath
  }

  static async saveFile(
    buffer: Buffer,
    filename: string,
    subDir: 'uploads' | 'edited' | 'exports' | 'thumbnails' | 'autosave' | 'ocr'
  ): Promise<string> {
    const dir = await this.ensureDir(subDir)
    // Persist relative paths so API routes can serve files without leaking absolute system paths.
    const filepath = join(dir, filename)
    await writeFile(filepath, buffer)
    return `storage/${subDir}/${filename}`
  }

  static async deleteFile(relativePath: string): Promise<void> {
    const fullPath = join(process.cwd(), relativePath)
    if (existsSync(fullPath)) {
      await unlink(fullPath)
    }
  }

  static async readFile(relativePath: string): Promise<Buffer> {
    const fullPath = join(process.cwd(), relativePath)
    return await readFile(fullPath)
  }

  static async saveUpload(buffer: Buffer, originalName: string): Promise<string> {
    const timestamp = Date.now()
    const safeName = originalName.replace(/[^\w.\-]+/g, '-')
    const filename = `${timestamp}-${safeName}`
    return await this.saveFile(buffer, filename, 'uploads')
  }

  static async saveThumbnail(buffer: Buffer, documentId: string): Promise<string> {
    const filename = `${documentId}.png`
    return await this.saveFile(buffer, filename, 'thumbnails')
  }

  static async saveAutosave(data: string, documentId: string): Promise<string> {
    const filename = `${documentId}.json`
    const buffer = Buffer.from(data, 'utf-8')
    return await this.saveFile(buffer, filename, 'autosave')
  }

  static async loadAutosave(documentId: string): Promise<string | null> {
    try {
      const buffer = await this.readFile(`storage/autosave/${documentId}.json`)
      return buffer.toString('utf-8')
    } catch (error) {
      return null
    }
  }
}
