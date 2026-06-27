import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { authRouters } from "./modules/auth/auth.route";
import { userRouter } from "./modules/user/user.route";
import { postRouter } from "./modules/post/post.route";
import { commentRouter } from "./modules/comment/comment.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouters);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);

export default app;
