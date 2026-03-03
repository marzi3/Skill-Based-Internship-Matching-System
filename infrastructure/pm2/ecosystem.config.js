module.exports = {
  apps: [{
    name: 'internship-platform-backend',
    script: './server.js',
    cwd: './backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }, {
    name: 'internship-platform-frontend',
    script: 'npm',
    args: 'start',
    cwd: './frontend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};