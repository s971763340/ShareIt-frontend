const dropZone = document.querySelector(".drop-zone");

const browseBtn = document.querySelector(".browsebtn");

const fileInput = document.querySelector("#fileinput");

const emailForm = document.querySelector("#emailForm");

const fileURL = document.querySelector("#fileURL")

const qrcode = document.querySelector(".qrcode")

const copyBtn = document.querySelector("#button")

const qrt = document.querySelector('.qrt')

const sharignContainer = document.querySelector(".sharing-container");

const bgProgress = document.querySelector(".bg-progress");

const progressContainer = document.querySelector(".progress-container");

const progressBar = document.querySelector(".progress-bar");

const host = "http://localhost:3000/";

const percentDiv = document.querySelector("#percent")

const uploadURL = `${host}api/files`;
//const uploadURL = host + "api/files"   ;
const emailURL = `${host}api/files/send`;

const toast = document.querySelector(".toast")


const maxAllowedSize = 100*1024*1024;

dropZone.addEventListener("dragover" ,(e)=>{
    e.preventDefault()
    if(!dropZone.classList.contains('dragged')){
        dropZone.classList.add('dragged');
    }
    
})//This event is fired continuously when an element or text selection is being dragged and the mouse pointer is over a valid drop target 

dropZone.addEventListener("dragleave" ,()=>{
    dropZone.classList.remove('dragged');
})//This event is fired when a dragged element or text selection leaves a valid drop target.

dropZone.addEventListener("drop" ,(e)=>{
    e.preventDefault()
    dropZone.classList.remove('dragged');
    let files=e.dataTransfer.files;
    console.log(files);
    if(files.length){
        fileInput.files = files; //trigger files for the input
        uploadFiles();
    }
    
});

fileInput.addEventListener("change" , ()=>{
    uploadFiles(); //for uploading by clicking on browse button
})

browseBtn.addEventListener("click" , ()=>{
    fileInput.click()//for click and open file browser
})

copyBtn.addEventListener("click", ()=>{
    fileURL.select()   //used to select the url in box
    //document.execCommand("copy")  //used to copy the url automatically
    navigator.clipboard.writeText(fileURL.value);  //alternative of above line
    showToast("Link Copied!")
})

const uploadFiles = ()=>{
    
    if(fileInput.files.length > 1){
        fileInput.value = ""
        showToast("Only Upload One File!")
        return;
    }
    const file = fileInput.files[0] // only first file is taken

    if(file.size > maxAllowedSize){
        fileInput.value = ""
        showToast("Max Size Is 100MB!")
        return;
    }
    progressContainer.style.display = "block";
    const formData = new FormData() //  (objects)used to capture HTML form and submit it using fetch or another network method
    formData.append("myfile" , file)           // insert file in formData
    const xhr= new XMLHttpRequest() //  objects are used to interact with servers
    xhr.onreadystatechange = () =>{     //it tells the state of the event either it is change or finish

        if(xhr.readyState == XMLHttpRequest.DONE ){
            console.log(xhr.response);
            onuploadsuccess(JSON.parse(xhr.response));
         }
        
    }

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = ()=>{
        fileInput.value = "";
        showToast(`Error in upload: ${xhr.statusText}`)
    }

    xhr.open("POST" , uploadURL);
    xhr.send(formData);
};

const updateProgress = (e) =>{  //for progress bar
    const percent = Math.round((e.loaded / e.total) * 100);   //calculating how much percent is the uploading done
    bgProgress.style.width = `${percent}%`; //for progress bar animation
    percentDiv.innerText = percent; //for percentage shown
    progressBar.style.transform = `scaleX(${percent/100})`

}

const onuploadsuccess = ({file:url })=>{   //destructuring the file to get the link
    console.log(url);
    fileInput.value="";
    //emailForm[2].removeAttribute("disabled")
    progressContainer.style.display = "none";
    sharignContainer.style.display = "block";
    fileURL.value = url;

    const qrValue = fileURL.value
     
    qrcode.src = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${qrValue}`;
    qrt.style.display = "block";
}

if(emailForm){
    emailForm.addEventListener("submit", (e)=>{
        e.preventDefault();
        const url = fileURL.value
        const formData = {
            uuid: url.split("/").splice(-1, 1)[0],  //split divides link into an array from the position where '/' is present
            //splice -> -1 selects the item from last , uuid is present at last
            emailto:emailForm.elements["to-mail"].value,
            emailfrom: "inshare79@gmail.com",
        }

        //emailForm[2].setA("disabled", "true")//to disable the send button
        console.table(formData);

        fetch(emailURL, {
            method: "post",
            headers:{
                "content-Type": "application/json",
            },
            body:JSON.stringify(formData),
        })
            .then((res)=>res.json())
            .then(({ success})=>{
                if(success){
                    sharignContainer.style.display = "none";
                    showToast("Email Sent")
                    qrcode.src = "purple.png";
                    qrt.style.display = "none";

                }
                
            });
    });
}

let toastTimer;
const showToast=(msg)=>{
    toast.innerText = msg;
    toast.style.transform = "translate(-50%, 0)";
    clearTimeout(toastTimer)
    toastTimer = setTimeout(()=>{
        toast.style.transform = "translate(-50%, 60px)";
    }, 2000);
};









