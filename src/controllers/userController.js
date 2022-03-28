import res from "express/lib/response";
import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

// export const profile = async (req, res) => {
//     const user = await User.find({ username });
//     return res.render("profile", { pageTitle: "profile", user });
// };

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

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize"
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup:false,
        scope:"read:user user:email",
        
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`
    return res.redirect(finalUrl)
}

export const finishGithubLogin = async(req, res) => {
    const baseURL="https://github.com/login/oauth/access_token";
    const config = {
        client_id:process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseURL}?${params}`
    const tokenRequest = await(await fetch(finalUrl, {
        method:"POST",
        headers:{
            Accept:"application/json"
        }
    })
    ).json();
    if("access_token" in tokenRequest) {
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await(
            await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `token ${access_token}`
            }
        })
        ).json();
        console.log(userData);
        const emailData = await(
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`
                }
            })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj){
            return res.redirect("/login");
        }
        const existingUser = await User.findOne({ email: emailObj.email });
        if (existingUser) {
            req.session.loggedIn = true;
            req.session.user = existingUser;
            return res.redirect("/")
        } else {
            const user = await User.create({
                name:userData.name,
                username:userData.login,
                email: emailObj.email,
                password:"",
                socialOnly:true,
                location:userData.location,
            })
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/")
        }
    } else {
        return res.render("login")
    }
}

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Log Out");
export const see = (req, res) => res.send("See User");

