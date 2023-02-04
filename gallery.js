let req = indexedDB.open("Camera", 1);
let body = document.querySelector("body");  
let db;
  
req.addEventListener("success", function(){
    db = req.result;
});

req.addEventListener("upgradeneeded", function(){
    let cameraDb = req.result;
    cameraDb.createObjectStore("Gallery", {keyPath:"mId"});
});

req.addEventListener("error", function(){
    console.log("error");
});


function addMedia(media, type){
    if(!db){ 
        return;
    } 
 
    let obj = {mId: Date.now(), media, type};

    let tx = db.transaction("Gallery", "readwrite");
    let gallery = tx.objectStore("Gallery");
    gallery.add(obj);
} 


function deleteMedia(id) {
    if (!db) {
        return;
    }

    let tx = db.transaction("Gallery", "readwrite");
    let gallery = tx.objectStore("Gallery");

    gallery.delete(Number(id));

}


function viewMedia(){
    let tx = db.transaction("Gallery", "readonly");
    let gallery = tx.objectStore("Gallery");
    let cReq = gallery.openCursor();

    cReq.addEventListener("success", function(){
        let cursor = cReq.result;
        if (cursor){
            let mediaObj = cursor.value;

            let div = document.createElement("div");
            div.classList.add("media-container");
            let downloadLink = "";

            if (mediaObj.type == "video") {
                let videoUrl = window.URL.createObjectURL(cursor.value.media);
                downloadLink = videoUrl;
                div.innerHTML = `<div class="media">
                <video src="${videoUrl}" autoplay loop controls muted loop>
                </div>
                <button class="download">Save to device</button>
                <button class="delete" data-id="${mediaObj.mId}}>Delete</button>`

            }
            else{
                downloadLink = cursor.value.media;
                div.innerHTML = `<div class="media">
                <img src="${cursor.value.media}"/>
                </div>
                <button class="download">Save to device</button>
                <button class="delete" data-id="${mediaObj.mId}}>Delete</button>`
            }

            let downloadBtn = div.querySelector(".download");
            downloadBtn.addEventListener("click", function (){
                let a = document.createElement("a");
                a.href = downloadLink;

                if (mediaObj.type == "video") {
                    a.download = "video.mp4";
                }
                else {
                    a.download = "img.png";
                }
                a.click();
                a.remove();
            });

            let deleteBtn = div.querySelector(".delete");
            deleteBtn.addEventListener("click", function(e) {
                let id = e.currentTarget.getAttribute("data-id");
                deleteMedia(id);

                e.currentTarget.parentElement.remove();
            });

            body.append(div);
            cursor.continue();
        }
    });
}



