module.exports = {
  apps: [
    {
      name: "backubm",
      script: "dist/server.js",
      cwd: "/root/backubm",
      watch: false,
      env_file: ".env",
      env: {
        NODE_ENV: "production"
        // MONGODB_URI: "mongodb://admin:seminario123@127.0.0.1:27018/seminario_ubm?authSource=admin"
      }
    }
  ]
};