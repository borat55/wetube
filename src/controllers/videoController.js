import Video from "../models/Video";

export const home = async (req, res) => {
    const videos = await Video.find({});
    console.log(videos);
    return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.render("404", {pageTitle: `Error: Video not found`})
    }
    return res.render("watch", { pageTitle: `Watch: ${video.title}`, video })
    
};

export const getEdit = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.render("404", {pageTitle: `Error: Video not found`})
    }
    return res.render("edit", { pageTitle: `Edit: ${video.title}`, video })
};

export const postEdit = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    const { title, description, hashtags } = req.body
    if (!video) {
        return res.render("404", {pageTitle: `Error: Video not found`})
    }
    video.title = title;
    video.description = description;
    video.hashtags = hashtags.split(",").map((word) => `#${word}`);
    await video.save();
    return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: `Upload Video` })
};

export const postUpload = async(req, res) => {
    const { title, description, hashtags } = req.body
    const video = new Video ({
        title,
        description,
        createdAt : Date.now(),
        hashtags: hashtags.split(",").map(word => `#${word}`),
        meta : {
            views : 0,
            rating : 0
        }
    })
    await video.save();
    return res.redirect("/");
}