"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const prisma_1 = require("./config/prisma");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const company_routes_1 = __importDefault(require("./modules/company/company.routes"));
const team_routes_1 = __importDefault(require("./modules/team/team.routes"));
const audience_routes_1 = __importDefault(require("./modules/audience/audience.routes"));
const campaign_routes_1 = __importDefault(require("./modules/campaign/campaign.routes"));
const survey_routes_1 = __importDefault(require("./modules/survey/survey.routes"));
const dispatch_routes_1 = __importDefault(require("./modules/dispatch/dispatch.routes"));
const response_routes_1 = __importDefault(require("./modules/response/response.routes"));
const credit_routes_1 = __importDefault(require("./modules/credit/credit.routes"));
const messaging_routes_1 = __importDefault(require("./modules/messaging/messaging.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: {
        policy: "cross-origin",
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
        const usersCount = await prisma_1.prisma.user.count();
        res.json({
            status: "Database connected",
            usersCount,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({
            status: "Database connection failed",
            error: "Unable to connect to database",
        });
    }
});
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads"), {
    setHeaders: (res) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
}));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/companies", company_routes_1.default);
app.use("/api/team", team_routes_1.default);
app.use("/api/audience", audience_routes_1.default);
app.use("/api/campaigns", campaign_routes_1.default);
app.use("/api/survey", survey_routes_1.default);
app.use("/api/dispatch", dispatch_routes_1.default);
app.use("/api/responses", response_routes_1.default);
app.use("/api/credits", credit_routes_1.default);
app.use("/api/messaging", messaging_routes_1.default);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
