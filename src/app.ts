import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { prisma } from "./config/prisma";
import authRoutes from "./modules/auth/auth.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import companyRoutes from "./modules/company/company.routes";
import teamRoutes from "./modules/team/team.routes";
import audienceRoutes from "./modules/audience/audience.routes";
import campaignRoutes from "./modules/campaign/campaign.routes";
import surveyRoutes from "./modules/survey/survey.routes";
import dispatchRoutes from "./modules/dispatch/dispatch.routes";
import responseRoutes from "./modules/response/response.routes";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    message: "API WhatsApp Insights is running",
    status: "OK",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/db-check", async (_req, res) => {
  try {
    const usersCount = await prisma.user.count();

    res.json({
      status: "Database connected",
      usersCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "Database connection failed",
      error: "Unable to connect to database",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/audience", audienceRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/responses", responseRoutes);

app.use(errorMiddleware);

export default app;