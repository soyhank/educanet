function formatMeta(meta?: object): string {
  return meta ? ` ${JSON.stringify(meta)}` : "";
}

export const log = {
  info: (msg: string, meta?: object) => {
    console.log(`[INFO] ${msg}${formatMeta(meta)}`);
  },
  warn: (msg: string, meta?: object) => {
    console.warn(`[WARN] ${msg}${formatMeta(meta)}`);
  },
  error: (msg: string, error?: unknown, meta?: object) => {
    const stack = error instanceof Error ? error.stack : String(error ?? "");
    console.error(`[ERROR] ${msg}${formatMeta(meta)}`, stack);
  },
};
