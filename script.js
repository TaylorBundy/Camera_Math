const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const btnCapturar = document.getElementById("btnCapturar");

const listaNumeros = document.getElementById("listaNumeros");

const resultadoElement = document.getElementById("resultado");

let numerosDetectados = [];
//const video = document.getElementById("video");

const zoomInput = document.getElementById("zoom");

let track;
const zoomValor = document.getElementById("zoomValor");

zoomInput.addEventListener("input", () => {
  zoomValor.textContent = Number(zoomInput.value).toFixed(1) + "x";
});

// ==========================
// INICIAR CAMARA
// ==========================

async function iniciarCamara2() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
      },

      audio: false,
    });

    video.srcObject = stream;
    track = stream.getVideoTracks()[0];
  } catch (error) {
    alert("No se pudo abrir la cámara");

    console.error(error);
  }
}
async function iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
      },

      audio: false,
    });

    video.srcObject = stream;

    track = stream.getVideoTracks()[0];

    configurarZoom();
  } catch (error) {
    console.error(error);

    alert("No se pudo abrir la cámara");
  }
}

// ==========================
// CONFIGURAR ZOOM
// ==========================

function configurarZoom() {
  const capabilities = track.getCapabilities();

  console.log(capabilities);

  // Verificar soporte
  if (!capabilities.zoom) {
    console.log("Zoom no soportado");

    zoomInput.disabled = true;

    return;
  }

  // Configurar slider
  zoomInput.min = capabilities.zoom.min;

  zoomInput.max = capabilities.zoom.max;

  zoomInput.step = capabilities.zoom.step || 0.1;

  zoomInput.value = capabilities.zoom.min;
}
// ==========================
// EVENTO ZOOM
// ==========================

zoomInput.addEventListener("input", async () => {
  if (!track) return;

  try {
    await track.applyConstraints({
      advanced: [
        {
          zoom: Number(zoomInput.value),
        },
      ],
    });
  } catch (error) {
    console.error("Error zoom:", error);
  }
});

// ==========================
// INICIAR
// ==========================

iniciarCamara();
//const zoomInput = document.getElementById("zoom");

// zoomInput.addEventListener("input", async () => {
//   const capabilities = track.getCapabilities();

//   if (!capabilities.zoom) return;

//   await track.applyConstraints({
//     advanced: [
//       {
//         zoom: Number(zoomInput.value),
//       },
//     ],
//   });
// });

//iniciarCamara();

// ==========================
// ESCANEAR
// ==========================

btnCapturar.addEventListener("click", async () => {
  btnCapturar.disabled = true;
  btnCapturar.textContent = "Escaneando...";

  try {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    //ctx.drawImage(video, 0, 0);
    const ancho = video.videoWidth;
    const alto = video.videoHeight;

    // RECORTE CENTRAL
    const recorteAncho = ancho * 0.45;
    const recorteAlto = alto * 0.9;

    const x = (ancho - recorteAncho) / 2;

    const y = (alto - recorteAlto) / 2;

    canvas.width = recorteAncho;
    canvas.height = recorteAlto;

    ctx.drawImage(
      video,

      x,
      y,

      recorteAncho,
      recorteAlto,

      0,
      0,

      recorteAncho,
      recorteAlto,
    );

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
