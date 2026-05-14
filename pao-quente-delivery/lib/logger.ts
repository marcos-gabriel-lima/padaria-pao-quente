type Level = "info" | "warn" | "error";
type LogData = Record<string, unknown>;

function log(level: Level, message: string, data?: LogData): void {
  const entry = { ts: new Date().toISOString(), level, message, ...data };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, data?: LogData) => log("info", message, data),
  warn: (message: string, data?: LogData) => log("warn", message, data),
  error: (message: string, data?: LogData) => log("error", message, data),
};
