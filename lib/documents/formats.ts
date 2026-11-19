const mimeByExtension = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
} as const;

export const documentAccept = Object.keys(mimeByExtension).map(ext => "." + ext).join(",");
export const documentMaxBytes = 50 * 1024 * 1024;

export function documentMime(file: Pick<File, "name" | "type">): string | undefined {
  const extension = file.name.toLowerCase().split(".").pop();
  const entry = Object.entries(mimeByExtension).find(([ext]) => ext === extension);
  if (!entry) return undefined;
  const type = file.type.split(";")[0].trim().toLowerCase();
  if (!type || type === "application/octet-stream" || type === entry[1]) return entry[1];
  return undefined;
}

export function documentPoints(value: string | null): string[] {
  if (!value) return [];
  try {
    const list: unknown = JSON.parse(value);
    return Array.isArray(list) ? list.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
