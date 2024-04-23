const hole = document.getElementById("hole");
const filelist = document.getElementById("filelist");
const clearButton = document.getElementById("clear");
const uploadButton = document.getElementById("upload");

let files = [];

// drag n drop
hole.addEventListener("dragover", (e) => {
  e.preventDefault();
  hole.style.borderColor = "#ccc";
});

hole.addEventListener("dragleave", () => {
  hole.style.borderColor = "#444";
});

hole.addEventListener("drop", (e) => {
  e.preventDefault();
  hole.style.borderColor = "#444";
  const newFiles = Array.from(e.dataTransfer.files);
  addFiles(newFiles);
  updateButtons();
});

// handle file input
hole.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = "true";
  input.accept = "*";
  input.style.display = "none";
  input.addEventListener("change", (e) => {
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
    updateButtons();
  });
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
});

// display selected files + update files array
const addFiles = (newFiles) => {
  newFiles.forEach((file) => {
    const listItem = document.createElement("li");
    listItem.classList.add("file");

    const fileName = document.createElement("span");
    fileName.textContent = file.name;
    listItem.appendChild(fileName);

    const fileSize = document.createElement("span");
    let sizeInBytes = file.size;

    if (sizeInBytes < 1024) {
      fileSize.textContent = sizeInBytes + " bytes";
    } else if (sizeInBytes < 1024 * 1024) {
      fileSize.textContent = (sizeInBytes / 1024).toFixed(2) + " KB";
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      fileSize.textContent = (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
    } else {
      fileSize.textContent =
        (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }

    listItem.appendChild(fileSize);

    const removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.addEventListener("click", () => {
      files.splice(files.indexOf(file), 1);
      filelist.removeChild(listItem);
      updateButtons();
    });
    listItem.appendChild(removeButton);

    filelist.appendChild(listItem);
    files.push(file);
  });
};

// update upload and clear buttons depending on state of files array
const updateButtons = () => {
  if (files.length > 0) {
    uploadButton.disabled = false;
    clearButton.disabled = false;
  } else {
    uploadButton.disabled = true;
    clearButton.disabled = true;
  }
};

// clear all files from interface
clearButton.addEventListener("click", () => {
  files = [];
  filelist.innerHTML = "";
  updateButtons();
});

// declare variables for progress indicator
const dots = document.createElement("span");
dots.textContent = ".";
let dotCount = 0;

// upload files
uploadButton.addEventListener("click", () => {
  let currentIndex = 0;

  const updateItemStatus = (index, message) => {
    const listItem = filelist.children[index];
    const statusElement = listItem.children[2];
    statusElement.textContent = message;
  };

  const uploadFile = () => {
    // check if all files are uploaded
    if (currentIndex >= files.length) {
      // all files uploaded
      files = [];
      return;
    }

    const file = files[currentIndex];
    const formData = new FormData();
    formData.append("file", file);

    updateItemStatus(currentIndex, "uploading...");

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        data = data.trim();
        const url = document.createElement("a");
        url.href = data;
        url.target = "_blank";
        url.textContent = data;

        const listItem = filelist.children[currentIndex];
        const removeButton = listItem.children[2];
        listItem.replaceChild(url, removeButton);

        const copyButton = document.createElement("button");
        copyButton.textContent = "copy to clipboard";
        copyButton.addEventListener("click", (event) => {
          event.stopPropagation();
          navigator.clipboard.writeText(data);
        });

        listItem.appendChild(copyButton);

        // remove current file from the formdata object to upload the next file
        formData.delete("file");

        // increment the current index and upload the next file
        currentIndex++;
        uploadFile();
      })
      .catch((error) => {
        console.error(error);
        updateItemStatus(currentIndex, "upload failed");
        // error handling here
      });
  };

  // start uploading the first file
  uploadFile();
});
