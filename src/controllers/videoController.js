import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const home = async (req, res) => {
    const videos = await Video.find({}).sort({ createdAt: "desc"}).populate("owner");
    return res.render("videos/home", { pageTitle: "Home", videos });
};

export const watch = async(req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    console.log("video.owner._id : ", video.owner._id);
    console.log("loggedInUser._id : ", res.locals.loggedInUser._id)
    if (!video) {
        return res.status(404).render("404", {pageTitle: `Error: Video not found`})
    }
    return res.render("videos/watch", { pageTitle: `Watch: ${video.title}`, video})
};

export const getEdit = async(req, res) => {
    const { id } = req.params;
    const { user: {_id} } = req.session
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", {pageTitle: `Error: Video not found`})
    }
    if (String(video.owner) !== String(_id)) {
        req.flash("error", "Not authorized.")
        return res.status(403).redirect("/");
    }
    return res.render("videos/edit", { pageTitle: `Edit: ${video.title}`, video })
};

export const postEdit = async(req, res) => {
    const { id } = req.params;
    const { user: {_id} } = req.session
    const video = await Video.findById({ _id: id });
    const { title, description, hashtags } = req.body;
    if (!video) {
        return res.status(404).render("404", {pageTitle: `Error: Video not found`})
    }
    if (String(video.owner) !== String(_id)) {
        req.flash("error", "You are not the owner of the video.")
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags:Video.formatHashtags(hashtags)
    });
    return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
    return res.render("videos/upload", { pageTitle: `Upload Video` })
};

export const postUpload = async(req, res) => {
    const { user: {_id} } = req.session;
    const { video, thumb } = req.files;
    const { title, description, hashtags } = req.body;
    const videoUrl = video[0].path;
    const thumbUrl = thumb[0].path;

    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl:Video.changePathFormula(videoUrl),
            thumbUrl:Video.changePathFormula(thumbUrl),
            owner: _id,
            createdAt : Date.now(),
            hashtags:Video.formatHashtags(hashtags),
            meta : {
                views : 0,
                rating : 0
            }
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save()
        return res.redirect("/");
    } catch (error) {
        return res.status(400).render("videos/upload", {
            pageTitle:"Upload Video",
            errorMessage: error._message,
        });
    }
}

export const deleteVideo = async(req, res) => {
    const { id } = req.params;
    const { user: {_id} } = req.session
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", {pageTitle: `Error: Video not found`})
    }
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    req.flash("info", `You have deleted ${video.title} video`)
    return res.redirect("/")
}

export const search = async(req, res) => {
    const { keyword } = req.query;
    let videos=[];
    if (keyword) {
        videos = await Video.find({
            title: {
                $regex : new RegExp(`${keyword}$`, "i")
            }
        }).populate("owner");
    };
    return res.render("videos/search", { pageTitle: "Search", videos});
}

export const registerView = async (req, res) => {
    const {id} = req.params;
    const video=await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
}

export const createComment = async(req, res) => {
    // const{id}= req.params;
    // const{text} = req.body;
    // const{session: {user}} = req;

    const {session:{user},
            body: {text},
            params:{id} }=req;

    const video = await Video.findById(id);
    if(!video) {
        return res.sendStatus(404);
    }
    const comment = await Comment.create({
        text,
        owner:user._id,
        video: id
    })
    video.comments.push(comment._id);
    video.save();

    return res.status(201).json({ newCommentId:comment._id });
}

export const deleteComment = async(req, res) => {
    const {id} = req.params;
    const comment = await Comment.findById(id).populate("owner");
    if (String(comment.owner._id) === String(req.session.user._id)) {
        await Comment.findByIdAndDelete(id);
        return res.sendStatus(201)}
    else {
        return res.sendStatus(404);
    }
}