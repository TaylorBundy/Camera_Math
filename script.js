const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const btnCapturar = document.getElementById("btnCapturar");

const listaNumeros = document.getElementById("listaNumeros");

const resultadoElement = document.getElementById("resultado");

let numerosDetectados = [];

// ==========================
// INICIAR CAMARA
// ==========================

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
    alert("No se pudo abrir la cámara");

    console.error(error);
  }
}

iniciarCamara();

// ==========================
// ESCANEAR
// ==========================

btnCapturar.addEventListener("click", async () => {
  btnCapturar.disabled = true;
  btnCapturar.textContent = "Escaneando...";

  try {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    // OCR
    const resultado = await Tesseract.recognize(canvas, "eng");

    const texto = resultado.data.text;

    console.log(texto);

    procesarTexto(texto);
  } catch (error) {
    console.error(error);

    alert("Error al escanear");
  } finally {
    btnCapturar.disabled = false;
    btnCapturar.textContent = "Escanear";
  }
});

// ==========================
// PROCESAR TEXTO
// ==========================

function procesarTexto(texto) {
  listaNumeros.innerHTML = "";

  numerosDetectados = [];

  const lineas = texto.split("\n");

  lineas.forEach((linea) => {
    const limpio = linea.replace(/\s/g, "").replace(/[^\d]/g, "");

    if (!limpio) return;

    const numero = parseInt(limpio);

    if (isNaN(numero)) return;

    numerosDetectados.push(numero);
  });

  renderNumeros();
}

// ==========================
// MOSTRAR NUMEROS
// ==========================

function renderNumeros() {
  listaNumeros.innerHTML = "";

  numerosDetectados.forEach((numero, index) => {
    const div = document.createElement("div");

    div.className = "numeroItem";

    const input = document.createElement("input");

    input.type = "number";

    input.value = numero;

    input.addEventListener("input", () => {
      numerosDetectados[index] = Number(input.value);
    });

    div.appendChild(input);

    listaNumeros.appendChild(div);
  });
}

// ==========================
// OPERACIONES
// ==========================

document.querySelectorAll(".operacion").forEach((btn) => {
  btn.addEventListener("click", () => {
    const op = btn.dataset.op;

    calcular(op);
  });
});

// ==========================
// CALCULAR
// ==========================

function calcular(operacion) {
  if (!numerosDetectados.length) {
    alert("No hay números");

    return;
  }

  let resultado = 0;

  switch (operacion) {
    case "sumar":
      resultado = numerosDetectados.reduce((a, b) => a + b, 0);

      break;

    case "restar":
      resultado = numerosDetectados.reduce((a, b) => a - b);

      break;

    case "multiplicar":
      resultado = numerosDetectados.reduce((a, b) => a * b, 1);

      break;

    case "promedio":
      resultado =
        numerosDetectados.reduce((a, b) => a + b, 0) / numerosDetectados.length;

      break;
  }

  resultadoElement.textContent = resultado.toLocaleString("es-AR");
}
