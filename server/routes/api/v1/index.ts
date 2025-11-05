import { Router } from "express";
import projectsRouter from "./projects";
import notebooksRouter from "./notebooks";
import charactersRouter from "./characters";
import { readRateLimiter } from "../../../security/rateLimiters";

const router = Router();

// Register all v1 API routes
router.use("/projects", projectsRouter);
router.use("/notebooks", notebooksRouter);
router.use("/characters", charactersRouter);

// API info endpoint
router.get("/", readRateLimiter, (req, res) => {
  res.json({
    version: "1.0.0",
    endpoints: [
      {
        path: "/api/v1/projects",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        description: "Manage your writing projects",
      },
      {
        path: "/api/v1/notebooks",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        description: "Manage your notebooks",
      },
      {
        path: "/api/v1/characters",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        description: "Manage characters within notebooks",
      },
    ],
    authentication: "Bearer token required in Authorization header",
    documentation: "/docs/api",
  });
});

export default router;
