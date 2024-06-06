module.exports = {
    apps: [
      {
        name: 'server',
        script: './index.js',
        instances: 4,
        exec_mode: 'cluster', // 'fork' for single instance, 'cluster' for multiple instances
        watch: true, // Optional: Restart if files change
        env: {
          NODE_ENV: 'development',
        },
      },
    ],
  };
  