const videoContainer = document.getElementById("videoContainer")
const form = document.getElementById("commentForm");
const commentDeleteBtns = document.querySelectorAll("#commentList li span:nth-child(3)");

const handleDelComment = async(event) => {
    const commentId = event.path[1].dataset.id;
    const response = await fetch(`/api/comments/${commentId}/delete`, {
        method: "DELETE",
    })
    if (response.status === 201) {
        const li = event.target.parentElement;
        li.remove();
    }
}

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("span");
    icon.innerText = "↳  ";
    const span = document.createElement("span");
    span.innerText = `  ${text}`;
    const span2 = document.createElement("span");
    span2.innerText = "❌";
    span2.addEventListener("click", handleDelComment);
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
}

const handleSubmit = async(event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === "") {
        return;
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({ text }),
    });
    
    if (response.status === 201) {
        textarea.value = "";
        const {newCommentId} = await response.json();
        addComment(text, newCommentId);
    }
}

const init = () => {
    form.addEventListener("submit", handleSubmit);
    commentDeleteBtns.forEach(btn => btn.addEventListener("click", handleDelComment));
};

if (form) {
    init();
}
