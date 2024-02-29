module.exports = {
  app: [
    {
      name: 'bandee-server',
      script: './app',
      instances: 3,
      exec_mode: 'cluster',
      merge_logs: true,
      autorestart: true,
      watch: ['app'],
      watch_delay: 1000,
      ignore_watch: ['node_modules'],
      watch_options: {
        followSymlinks: false,
      },
    },
  ],
};
