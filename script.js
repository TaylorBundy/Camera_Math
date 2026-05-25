// script.js

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const btnEscanear = document.getElementById("btnEscanear");

const totalElement = document.getElementById("total");
const lista = document.getElementById("lista");

let total = 0;

async function iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
      },
      audio: false,
    });

    video.srcObject = stream;
  } catch (error) {
    alert("No se pudo acceder a la cámara");

    console.error(error);
  }
}

iniciarCamara();

btnEscanear.addEventListener("click", async () => {
  btnEscanear.disabled = true;
  btnEscanear.textContent = "Escaneando...";

  try {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const resultado = await Tesseract.recognize(canvas, "eng");

    const texto = resultado.data.text;

    console.log(texto);

    // Buscar números enteros y decimales
    const numeros = texto.match(/\d+([.,]\d+)?/g);

    if (!numeros) {
      alert("No se encontraron números");

      return;
    }

    numeros.forEach((numero) => {
      const valor = parseFloat(numero.replace(",", "."));

      if (isNaN(valor)) return;

      total += valor;

      const div = document.createElement("div");

      div.className = "item";

      div.textContent = valor;

      lista.prepend(div);
    });

    totalElement.textContent = total.toFixed(2);
  } catch (error) {
    console.error(error);

    alert("Error al escanear");
  } finally {
    btnEscanear.disabled = false;
    btnEscanear.textContent = "Escanear Número";
  }
});
