function parsePort(raw: string | undefined): number {
  if (!raw?.trim()) {
    return 3021;
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${raw}`);
  }
  return port;
}

export const config = {
  port: parsePort(process.env.PORT),
};
