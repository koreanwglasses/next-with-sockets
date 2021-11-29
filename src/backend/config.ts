import fs from "fs";

const read = (filename?: string) =>
  filename && fs.existsSync(filename)
    ? fs.readFileSync(filename, "utf8")
    : undefined;

const config = {
  dev: process.env.NODE_ENV === "development",

  server: {
    /**
     * Port to start express server on
     */
    port: +(process.env.PORT || 3000),
    host: process.env.HOST ?? "localhost",
  },

  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? read(process.env.DB_PASSWORD_FILE),
    name: process.env.DB_NAME || "app",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 27017,
  },

  session: {
    secret:
      process.env.SESSION_SECRET ??
      read(process.env.SESSION_SECRET_FILE) ??
      "secret",
  },
};

export default config;
