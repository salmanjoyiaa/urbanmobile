/** Relative paths inside the `maintenance-media` bucket (not full URLs). */
export function isMaintenanceMediaVideoPath(path: string): boolean {
  return /\.(mp4|webm|mov)$/i.test(path);
}
