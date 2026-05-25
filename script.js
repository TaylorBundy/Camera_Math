const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const btnCapturar = document.getElementById("btnCapturar");

const listaNumeros = document.getElementById("listaNumeros");

const resultadoElement = document.getElementById("resultado");

let numerosDetectados = [];
let nivelZoom = 1;
const zoomInput = document.getElementById("zoom");

let track;
const zoomValor = document.getElementById("zoomValor");

// const tempCanvas = document.createElement("canvas");

// const tempCtx = tempCanvas.getContext("2d");

// tempCanvas.width = canvas.width * 2;

// tempCanvas.height = canvas.height * 2;

// tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

// const resultado = await Tesseract.recognize(tempCanvas, "eng", {
//   logger: (m) => console.log(m),
// });

document.documentElement.style.setProperty("--zoom", 1);

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
  nivelZoom = Number(zoomInput.value);

  zoomValor.textContent = nivelZoom.toFixed(1) + "x";

  // ======================
  // ZOOM NATIVO
  // ======================
  // ACTUALIZAR CSS
  document.documentElement.style.setProperty("--zoom", nivelZoom);

  if (!track) return;

  try {
    const capabilities = track.getCapabilities();

    if (capabilities.zoom) {
      await track.applyConstraints({
        advanced: [
          {
            zoom: nivelZoom,
          },
        ],
      });
    }
  } catch (error) {
    console.log("Zoom nativo no disponible");
  }
});

// zoomInput.addEventListener("input", async () => {
//   if (!track) return;

//   try {
//     await track.applyConstraints({
//       advanced: [
//         {
//           zoom: Number(zoomInput.value),
//         },
//       ],
//     });
//   } catch (error) {
//     console.error("Error zoom:", error);
//   }
// });

// ==========================
// INICIAR
// ==========================

iniciarCamara();

btnCapturar.addEventListener("click", async () => {
  btnCapturar.disabled = true;

  btnCapturar.textContent = "Escaneando...";

  try {
    const ancho = video.videoWidth;

    const alto = video.videoHeight;

    // ======================
    // ZOOM DIGITAL
    // ======================

    const zoomAncho = ancho / nivelZoom;

    const zoomAlto = alto / nivelZoom;

    // ======================
    // RECORTE CENTRAL
    // ======================

    const recorteAncho = zoomAncho * 0.45;

    const recorteAlto = zoomAlto * 0.9;

    const x = (ancho - recorteAncho) / 2;

    const y = (alto - recorteAlto) / 2;

    // ======================
    // CANVAS
    // ======================

    // canvas.width = recorteAncho;

    // canvas.height = recorteAlto;
    canvas.width = Math.floor(recorteAncho);

    canvas.height = Math.floor(recorteAlto);

    // ======================
    // DIBUJAR
    // ======================

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

    // ======================
    // BLANCO Y NEGRO
    // ======================

    mejorarImagen();

    const tempCanvas = document.createElement("canvas");

    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = canvas.width * 2;

    tempCanvas.height = canvas.height * 2;

    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

    // ======================
    // OCR
    // ======================
    const resultado = await Tesseract.recognize(tempCanvas, "eng", {
      logger: (m) => console.log(m),

      tessedit_char_whitelist: "0123456789",
    });

    // const resultado = await Tesseract.recognize(
    //   canvas,

    //   "eng",

    //   {
    //     logger: (m) => console.log(m),
    //   },
    // );

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

function mejorarImagen() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const promedio = (data[i] + data[i + 1] + data[i + 2]) / 3;

    // CONTRASTE
    //const valor = promedio > 140 ? 255 : 0;
    const valor = promedio > 190 ? 255 : 0;

    data[i] = valor;
    data[i + 1] = valor;
    data[i + 2] = valor;
  }

  ctx.putImageData(imageData, 0, 0);
}

// ==========================
// PROCESAR TEXTO
// ==========================

function procesarTexto(texto) {
  listaNumeros.innerHTML = "";

  numerosDetectados = [];

  const lineas = texto.split("\n");

  lineas.forEach((linea) => {
    //const limpio = linea.replace(/\s/g, "").replace(/[^\d]/g, "");
    const match = linea.match(/\d+/);

    if (!match) return;

    const numero = parseInt(match[0]);

    //if (!limpio) return;

    //const numero = parseInt(limpio);

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
