// Initializes database during development with `docker-compose up`
db.createUser({
  user: "root",
  pwd: "secret",
  roles: [
    {
      role: "readWrite",
      db: "app",
    },
  ],
});
