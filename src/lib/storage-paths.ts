import { join } from 'path'

/** Writable storage root — uses /tmp on Vercel serverless, local storage/ otherwise. */
export function getStorageRoot(): string {
  if (process.env.VERCEL) {
    return join('/tmp', 'doc-tool-kit-storage')
  }
  return join(process.cwd(), 'storage')
}

export function getStorageDir(subDir: string): string {
  return join(getStorageRoot(), subDir)
}

export function toStorageRelativePath(subDir: string, filename: string): string {
  return `storage/${subDir}/${filename}`
}

export function resolveStoragePath(relativePath: string): string {
  const normalized = relativePath.replace(/^storage[/\\]/, '')
  return join(getStorageRoot(), ...normalized.split(/[/\\]/))
}
