import express from "express";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares"
import { logout, getEditProfile, postEditProfile, startGithubLogin, finishGithubLogin } from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout)
userRouter.route("/edit-profile").all(protectorMiddleware).get(getEditProfile).post(postEditProfile);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin)

export default userRouter;