type LogLevel = "info" | "error" | "warn";

function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
    console.log(
        JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...meta
        })
    );
}

export const logger = {
    info(message: string, meta?: Record<string, unknown>) {
        log("info", message, meta);
    },

    warn(message: string, meta?: Record<string, unknown>) {
        log("warn", message, meta);
    },

    error(message: string, meta?: Record<string, unknown>) {
        log("error", message, meta);
    }
};
