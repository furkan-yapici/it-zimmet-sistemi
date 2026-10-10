import express from "express";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth";
import departmentRoutes from "./routes/departments";
import userRoutes from "./routes/users";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Backend ${config.port} portunda çalışıyor`);
});
