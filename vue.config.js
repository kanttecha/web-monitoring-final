const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    port: 8080, // same port in config_ip_port_server.js
  },
  transpileDependencies: true,
})
