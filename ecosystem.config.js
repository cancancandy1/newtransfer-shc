// /app/web/new-transfer-shc/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'new-transfer-shc',
    script: 'node_modules/.bin/next',
    args: 'start -p 3023',
    cwd: '/app/web/new-transfer-shc',
    env: {
      NODE_ENV: 'production',
      PORT: 3023,
      // ระบุตัวแปร env ที่จำเป็นตรงนี้เลย
      DATABASE_URL: "mysql://root:shc%40dmin2022@localhost:3306/new_transfer_shc",
      AUTH_URL: "https://shc.sut.ac.th/new-transfer/api/auth",
      NEXTAUTH_URL: "https://shc.sut.ac.th/new-transfer/api/auth",
      AUTH_TRUST_HOST: "true",
      AUTH_SECRET: "7gsQRZCgBiFK4ScwkGbk7TG3h7p6oHQMecjHttjZWx4=",
      NEXT_PUBLIC_BASE_PATH: "/new-transfer",
      SUTSPORT_API_URL: "https://sutsport.sut.ac.th/service/member/code/",
      SUTSPORT_API_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNjMwMzMiLCJqdGkiOiIzMTI3Mzc4Ni04ZWVkLTRhZjQtOGIzMi1iYjg0NTRmYmU4ZjgiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiMjYzMDMzIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjpbIlN0YWZmIiwiTWVtYmVyIl0sImV4cCI6MTY1NTI4MTQ5MSwiaXNzIjoiU01BUlQtU0hDIiwiYXVkIjoiU1RBRkYifQ.0ClLxPWQS25qSDrqXN82DI0-LUruN4loKoOf0XoNkGA"
    },
  }],
};
