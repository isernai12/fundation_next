const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/callback/credentials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

// NextAuth credentials login usually needs csrf token, let's just fetch /login and grep for header instead.
