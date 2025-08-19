module.exports = (app) => {
  if (typeof app.channel !== "function") {
    return
  }

  app.on("connection", (connection) => {
    app.channel("anonymous").join(connection)
  })

  app.on("login", (authResult, { connection }) => {
    if (connection) {
      app.channel("authenticated").join(connection)
      app.channel("anonymous").leave(connection)
    }
  })

  // Publish conversion events to all connected clients
  app.service("convert").publish("created", () => {
    return app.channel("anonymous")
  })
}
