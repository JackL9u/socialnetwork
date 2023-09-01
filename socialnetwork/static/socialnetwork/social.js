"use strict"

function loadPosts() {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return
        updatePage(xhr)
    }

    xhr.open("GET", "/get-global", true)
    xhr.send()
}

function updatePage(xhr) {
    if (xhr.status === 200) {
        let response = JSON.parse(xhr.responseText)
        console.log('I got here')
        updatePost(response)
        return
    }

    if (xhr.status === 0) {
        displayError("Cannot connect to server")
        return
    }


    if (!xhr.getResponseHeader('content-type') === 'application/json') {
        displayError(`Received status = ${xhr.status}`)
        return
    }

    let response = JSON.parse(xhr.responseText)
    if (response.hasOwnProperty('error')) {
        displayError(response.error)
        return
    }

    displayError(response)
}

function displayError(message) {
    console.log(message)
}

function updatePost(posts) {
    let list = document.getElementById("posts_go_here")
    posts.forEach(post => {
        let existingPost = document.getElementById(`id_post_div_${post.id}`)
        if (!existingPost) {
            let postItem = makePostItem(post)
            postItem.id = `id_post_div_${post.id}`
            postItem.style.textAlign = "center";
            list.append(postItem)
        }
        updateComment(post)
    });
}

function makePostItem(post) {
    const postDate = new Date(post.time)
    const formattedDate = `${postDate.getMonth() + 1}/${postDate.getDate()}/${postDate.getFullYear()}`
    const formattedTime = formattedDate
    let secondLine = `<p><font size="5">Post by <a id='id_post_profile_${post.id}' href="#" style="font-style: italic;">${post.post_user_first_name} ${post.post_user_last_name}</a> - <span id="id_post_text_${post.id}"> ${sanitize(post.text)} </span> - <span id="id_post_date_time_${post.id}" style="font-style: italic;"> ${formattedDate} ${formattedTime} </span></font></p>`
    let commentDiv = `<div id="post_${post.id}_comments_go_here"></div>`
    let commentButton = `<div style="text-align: center;"> <label>Comment: </label> <input id='id_comment_input_text_${post.id}' type="text" name="comment_text" autofocus> <button id='id_comment_button_${post.id}' type="submit" style="font-size: 13px; padding: 5px 10px;" onclick="addComment(${post.id})">Submit</button></div>`

    let element = document.createElement("div")
    element.innerHTML = `${secondLine} ${commentDiv} ${commentButton}`

    return element
}

function sanitize(s) {
    // Be sure to replace ampersand first
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
}

function updateComment(post) {
    let divID = `post_${post.id}_comments_go_here`
    let commentList = document.getElementById(divID)
    (post.comments).forEach(comment => {
        let existingComment = document.getElementById(`id_comment_div_${comment.id}`)
        if (!existingComment) {
            let commentItem = makeCommentItem(comment)
            commentItem.id = `id_comment_div_${comment.id}`
            commentItem.style.marginLeft = "100px";
            commentList.append(commentItem)
        }
    })
}

function makeCommentItem(comment) {
    const commentDate = new Date(comment.time)
    const formattedDate = `${commentDate.getMonth() + 1}/${commentDate.getDate()}/${commentDate.getFullYear()}`
    const formattedTime = comment.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    let line = `<p><font size="4">Comment by <a id='id_comment_profile_${comment.id}' href="#" style="font-style: italic;">${comment.comment_user_first_name} ${comment.comment_user_last_name}</a> - <span id="id_comment_text_${comment.id}"> ${sanitize(comment.text)} </span> - <span id="id_comment_date_time_${comment.id}" style="font-style: italic;"> ${formattedDate} ${formattedTime} </span></font></p>`

    let element = document.createElement("div")
    element.innerHTML = `${line}`

    return element
}

function addComment(postID) {
    let inputID = `id_comment_input_text_${postID}`
    let itemTextElement = document.getElementById(inputID)
    let commentValue = itemTextElement.value

    itemTextElement.value = ''
    displayError('')

    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return
        updatePage(xhr)
    }

    xhr.open("POST", addCommentURL, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`post_id=${postID}&comment_text=${commentValue}&csrfmiddlewaretoken=${getCSRFToken()}`)
}

function getCSRFToken() {
    let cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim()
        if (c.startsWith("csrftoken=")) {
            return c.substring("csrftoken=".length, c.length)
        }
    }
    return "unknown"
}