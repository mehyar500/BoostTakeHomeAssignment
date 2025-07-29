// swaggerDef.cjs
module.exports = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Boost URL Shortener API",
      version: "1.0.0",
      description: "OpenAPI spec for /docs",
    },
  },
  apis: ["./src/routes/*.ts"],
};
