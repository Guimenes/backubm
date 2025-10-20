module.exports = {
  apps: [
    {
      name: "seminario-ubm-backend",
      script: "dist/server.js",
      cwd: "/root/backubm",
      instances: 2, // 2 instâncias para load balancing
      exec_mode: "cluster",
      watch: false,
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      // Configurações de restart automático
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",

      // Logs
      log_file: "/root/backubm/logs/combined.log",
      out_file: "/root/backubm/logs/out.log",
      error_file: "/root/backubm/logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",

      // Configurações de memória
      max_memory_restart: "500M",

      // Configurações de monitoramento
      autorestart: true,
      ignore_watch: ["node_modules", "logs"],

      // Script de pós-deploy
      post_update: ["npm install", "npm run build"],
    },
  ],

  deploy: {
    production: {
      user: "root",
      host: "177.71.71.149",
      ref: "origin/main",
      repo: "https://github.com/Guimenes/backubm.git",
      path: "/root/backubm",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
    },
  },
};
