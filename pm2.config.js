module.exports = {
    script: './dist/index.js',
    interpreter: 'node',
    exec_mode: 'fork',
    instances: 1,
    watch: false,
    autorestart: false,
    cron_restart: '*/25 * * * *',
  };
  