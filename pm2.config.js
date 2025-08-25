module.exports = {
    script: './dist/index.js',
    interpreter: 'node',
    exec_mode: 'fork',
    cron_restart: '*/25 * * * *', // Run every 5 minutes
  };
  