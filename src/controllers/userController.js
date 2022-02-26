import res from "express/lib/response";
import User from "../models/User";

export const getJoin = (req, res) => 
    res.render("join", { pageTitle:"join" });

export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    const pageTitle = "Join";
    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage:"Password confirmation does not match to the password."
        })
    }

    const usernameExists = await User.exists({username});
    if (usernameExists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage:"This username is already taken."
        });
    }

    const emailExists = await User.exists({email});
    if (emailExists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage:"This email is already taken."
        });
    }

    try {
        await User.create({
            name,
            username,
            email,
            password,
            location,
        })
        return res.redirect("/login")
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: error._message,
        });
    }
};

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const login = (req, res) => res.send("Login Page");
export const logout = (req, res) => res.send("Log Out");
export const see = (req, res) => res.send("See User");
