import app from "./app.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`🌐  Boost URL Shortener listening on port ${PORT}`);
});
