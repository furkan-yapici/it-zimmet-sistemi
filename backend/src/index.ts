import express from "express";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Backend ${config.port} portunda çalışıyor`);
});
