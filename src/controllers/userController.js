import res from "express/lib/response";
import User from "../models/User";
import bcrypt from "bcrypt";

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

export const getLogin = (req, res) => 
    res.render("login", { pageTitle:"Login" });

export const postLogin = async(req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({username})

    if(!user) {
        return res.status(400).render("login", {
            pageTitle, 
            errorMessage:"An account with this username does not exist"
        });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(400).render("login", {
            pageTitle, 
            errorMessage:"Wrong password"
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Log Out");
export const see = (req, res) => res.send("See User");
