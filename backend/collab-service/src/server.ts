import corsHandler from "@/middleware/corsHandler";
import errorHandler from "@/middleware/errorHandler";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";

const app: Express = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.options("*", cors())
app.use(corsHandler)

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Hello from collab-service!"
  })
})

// Error handling
app.use(errorHandler())

export default app;
