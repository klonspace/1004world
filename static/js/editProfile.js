function initEditableProfile() {
    var editButtons = document.querySelectorAll(".editButton");
    for (var i = 0; i < editButtons.length; i++) {
        editButtons[i].addEventListener("click", goEditMode)
    }

    document.getElementById("saveNewPass").addEventListener("click", saveNewPass)
}

async function saveNewPass() {
    console.log("he")
    if(document.getElementById("newPassword").value == document.getElementById("newPasswordConf").value) {
        var params = {
            whichVal: "password",
            value: document.getElementById("newPassword").value,
            oldPassword: document.getElementById("oldPassword").value
        }
        var success = await postData('/editUserInfo', params);
        if(success.success == "saved") {
            document.getElementById("newPassword").value = ""
            document.getElementById("newPasswordConf").value = ""
            document.getElementById("oldPassword").value = ""
            alert("Your password was changed succesfully")
        }
        else {
            alert(success.sucess)
        }
    }
}

function goEditMode() {
    var parent = this.parentNode.parentNode;
    var textSpan = parent.querySelector("span.content");
    var contentToHide = parent.querySelector("span.preview");

    contentToHide.classList.add("hide")
    var newContent = document.createElement("span")
    newContent.classList.add("newContent");
    var newInput = document.createElement("input")
    newInput.type = "text"
    newInput.value = textSpan.innerHTML;
    newContent.appendChild(newInput)
    var newSave = document.createElement("input")
    newSave.type = "button"
    newSave.value = "save";
    newContent.appendChild(newSave)
    parent.appendChild(newContent)
    newSave.addEventListener("click", saveContent)
}

async function saveContent() {
    var parent = this.parentNode.parentNode;
    var textSpan = parent.querySelector("span.content");
    var hiddenContent = parent.querySelector("span.preview");
    var newContent = parent.querySelector("span.newContent");
    var newValue = parent.querySelector("span.newContent input").value;
    console.log(textSpan)
    var params = {
        whichVal: textSpan.dataset.valtype,
        value: newValue
    }
    var success = await postData('/editUserInfo', params);
    if(success.success == "saved") {
        textSpan.innerHTML = parent.querySelector("span.newContent input").value;
    hiddenContent.classList.remove("hide")
    newContent.remove()
    }
    else{
        alert(success.success)
    }
    


}

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}