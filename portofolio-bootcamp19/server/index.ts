import { app } from "./app.ts";

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`);
});