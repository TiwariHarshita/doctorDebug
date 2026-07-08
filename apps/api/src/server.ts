import app from "./app";
import { env } from "./config/env";

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
