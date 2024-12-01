const imageInput = document.getElementById("imageInput");
const memeCanvas = document.getElementById("memeCanvas");
const topTextInput = document.getElementById("topText");
const bottomTextInput = document.getElementById("bottomText");
const downloadBtn = document.getElementById("downloadBtn");
const saveBtn = document.getElementById("saveBtn");
const galleryContainer = document.getElementById("galleryContainer");
const ctx = memeCanvas.getContext("2d");

let image = null;

// Charger les mèmes depuis le local storage au démarrage
document.addEventListener("DOMContentLoaded", loadGallery);

imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        image = new Image();
        image.src = reader.result;
        image.onload = () => {
            const dimensions = resizeImage(image, 600, 400);
            memeCanvas.width = dimensions.width;
            memeCanvas.height = dimensions.height;

            ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
            ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
            updateCanvas();
        };
    };

    reader.readAsDataURL(file);
});

function resizeImage(image, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
    return {
        width: image.width * ratio,
        height: image.height * ratio,
    };
}

[topTextInput, bottomTextInput].forEach(input => {
    input.addEventListener("input", updateCanvas);
});

function adjustFontSize(imageWidth, text) {
    let fontSize = imageWidth * 0.08;
    ctx.font = `${fontSize}px Impact`;

    const textWidth = ctx.measureText(text).width;
    while (textWidth > imageWidth - 20) {
        fontSize -= 2;
        ctx.font = `${fontSize}px Impact`;
    }

    return fontSize;
}

function updateCanvas() {
    if (image) {
        ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
        ctx.drawImage(image, 0, 0, memeCanvas.width, memeCanvas.height);

        const topFontSize = adjustFontSize(memeCanvas.width, topTextInput.value);
        const bottomFontSize = adjustFontSize(memeCanvas.width, bottomTextInput.value);

        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.font = `${topFontSize}px Impact`;
        ctx.fillText(topTextInput.value, memeCanvas.width / 2, 50);
        ctx.strokeText(topTextInput.value, memeCanvas.width / 2, 50);

        ctx.font = `${bottomFontSize}px Impact`;
        ctx.fillText(bottomTextInput.value, memeCanvas.width / 2, memeCanvas.height - 20);
        ctx.strokeText(bottomTextInput.value, memeCanvas.width / 2, memeCanvas.height - 20);
    }
}

downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = memeCanvas.toDataURL();
    link.click();
});

saveBtn.addEventListener("click", () => {
    const dataUrl = memeCanvas.toDataURL();

    // Ajouter le mème à la galerie et au local storage
    saveMemeToLocalStorage(dataUrl);

    // Réinitialiser le générateur de mèmes
    resetMemeGenerator();

    // Recharger la galerie mise à jour
    loadGallery();
});

function saveMemeToLocalStorage(memeDataUrl) {
    // Récupérer les mèmes existants
    const memes = JSON.parse(localStorage.getItem("memes")) || [];

    // Ajouter le nouveau mème
    memes.push(memeDataUrl);

    // Sauvegarder à nouveau dans le local storage
    localStorage.setItem("memes", JSON.stringify(memes));
}

function loadGallery() {
    // Vider la galerie
    galleryContainer.innerHTML = "";

    // Charger les mèmes depuis le local storage
    const memes = JSON.parse(localStorage.getItem("memes")) || [];

    // Ajouter chaque mème à la galerie
    memes.forEach(memeUrl => {
        const img = document.createElement("img");
        img.src = memeUrl;
        galleryContainer.appendChild(img);
    });
}

function resetMemeGenerator() {
    ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
    topTextInput.value = "";
    bottomTextInput.value = "";
    image = null;
}

function saveBtnClick() {
    const dataUrl = memeCanvas.toDataURL();
    saveMemeToLocalStorage(dataUrl);
    resetMemeGenerator();
    loadGallery();
}

function loadGallery() {
    galleryContainer.innerHTML = "";

    const memes = JSON.parse(localStorage.getItem("memes")) || [];

    memes.forEach((memeUrl, index) => {
        const memeContainer = document.createElement("div");
        memeContainer.className = "meme-container";

        const img = document.createElement("img");
        img.src = memeUrl;

        const overlay = document.createElement("div");
        overlay.className = "overlay";

        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Télécharger";
        downloadBtn.addEventListener("click", () => downloadMeme(memeUrl));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Supprimer";
        deleteBtn.addEventListener("click", () => deleteMeme(index));

        overlay.appendChild(downloadBtn);
        overlay.appendChild(deleteBtn);

        memeContainer.appendChild(img);
        memeContainer.appendChild(overlay);

        galleryContainer.appendChild(memeContainer);
    });
}

function downloadMeme(url) {
    const link = document.createElement("a");
    link.href = url;
    link.download = "meme.png";
    link.click();
}

// Fonction pour gérer le changement d'image
function handleImageChange(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        const newImage = new Image();
        newImage.src = reader.result;

        newImage.onload = () => {
            // Redimensionner l'image et dessiner
            const dimensions = resizeImage(newImage, 600, 400);
            memeCanvas.width = dimensions.width;
            memeCanvas.height = dimensions.height;

            ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
            ctx.drawImage(newImage, 0, 0, dimensions.width, dimensions.height);

            updateCanvas(); // Met à jour le canvas avec les textes actuels
        };
    };

    reader.readAsDataURL(file);
}


function deleteMeme(index) {
    const memes = JSON.parse(localStorage.getItem("memes")) || [];
    memes.splice(index, 1);
    localStorage.setItem("memes", JSON.stringify(memes));
    loadGallery();
}

document.getElementById('shareBtn').addEventListener('click', function () {
    const canvas = document.getElementById('memeCanvas');
    const dataUrl = canvas.toDataURL('image/png'); // Convertir le canvas en image

    if (navigator.share) {
        navigator.share({
            title: 'Voici mon mème !',
            text: 'Regardez ce mème que j\'ai créé !',
            files: [new File([dataUrl], 'meme.png', { type: 'image/png' })],
        })
            .then(() => console.log('Partage réussi !'))
            .catch((error) => console.log('Erreur de partage :', error));
    } else {
        alert('L\'API de partage n\'est pas supportée par votre navigateur.');
    }
});