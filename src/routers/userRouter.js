import express from "express";
import { protectorMiddleware, publicOnlyMiddleware, uploadFiles } from "../middlewares"
import { logout, getEditProfile, postEditProfile, startGithubLogin, finishGithubLogin, getChangePassword, postChangePassword } from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout)
userRouter
.route("/edit-profile")
.all(protectorMiddleware)
.get(getEditProfile)
.post(uploadFiles.single("avatar"), postEditProfile);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword)
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin)


export default userRouter;