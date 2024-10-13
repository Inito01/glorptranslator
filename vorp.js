"use strict";

// SI, HAY JQUERY Y JS PURO EN EL MISMO ARCHIVO, NO ME JUZGUEN
// NO HAY TIEMPO PARA HACERLO DE OTRA FORMA

$(document).ready(function () {
  $("li").click(function () {
    var tabId = $(this).find(".tab").data("tab");
    $(".tab-content").addClass("hidden").removeClass("active");
    $("#" + tabId)
      .removeClass("hidden")
      .addClass("active");

    $("li").removeClass("active");
    $(this).addClass("active");

    $("a").removeClass("text-alienDark bg-gray-200");
    $(this).find("a").addClass("text-alienDark bg-gray-200");

    $("textarea").val("");
  });
});

let diccionario = {};

fetch("dictionary.json")
  .then((response) => response.json())
  .then((data) => {
    diccionario = data.dictionary;
  })
  .catch((error) => console.error("Error al cargar el diccionario:", error));

function espanolAGlorp(texto) {
  return texto
    .toLowerCase()
    .split("")
    .map((char) => diccionario[char] || char)
    .join("");
}

function glorpAEspanol(texto) {
  const diccionarioInvertido = Object.fromEntries(Object.entries(diccionario).map(([key, value]) => [value, key]));
  return texto
    .toLowerCase()
    .split("")
    .map((char) => diccionarioInvertido[char] || char)
    .join("");
}

function manejarTraduccionEspanol() {
  const inputTextarea = document.getElementById("spanish");
  const outputTextarea = document.getElementById("glorp");
  const textoOriginal = inputTextarea.value;
  const textoTraducido = espanolAGlorp(textoOriginal);
  outputTextarea.value = textoTraducido;
  inputTextarea.value = "";
}

function manejarTraduccionGlorp() {
  const inputTextarea = document.getElementById("glorp-input");
  const outputTextarea = document.getElementById("spanish-output");
  const textoOriginal = inputTextarea.value;
  const textoTraducido = glorpAEspanol(textoOriginal);
  outputTextarea.value = textoTraducido;
  inputTextarea.value = "";
}

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

const phrases = [
  "⎐⊸⌿ ⎐⍜⌿",
  "⌇⍜⌰⍜ ⏁⍦⋏☌⍜ ⎍⋏⏃ ⋔⊸⌇⊸⍜⋏",
  "◫⍦⌇⏁ও⎍⊸ও ⏃ ⏁⍜◫⍜⌇ ⌰⍜⌇ ⊑⎍⋔⏃⋏⍜⌇",
  "⊬ ☊⍜⋏⍾⎍⊸⌇⏁⏃ও ⌰⏃ ⏁⊸⍦ওও⏃",
  "⌿⍦ও⍜ ⌿ও⊸⋔⍦ও⍜",
  "◫⍦⏚⍜ ⏃⌿ও⍦⋏◫⍦ও ⏃ ⊑⏃⏚⌰⏃ও",
  "⌇⎍ ⊸◫⊸⍜⋔⏃",
];

const el = document.querySelector(".s-scramble");
const fx = new TextScramble(el);

let counter = 0;
const next = () => {
  fx.setText(phrases[counter]).then(() => {
    setTimeout(next, 1500);
  });
  counter = (counter + 1) % phrases.length;
};

next();

// AUTENTICACIÓN
function encriptarContrasena(contrasena) {
  const encoder = new TextEncoder();
  const data = encoder.encode(contrasena);
  return crypto.subtle.digest("SHA-256", data).then((hash) => {
    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  });
}

function solicitarCredenciales() {
  const usuario = prompt("Ingrese su usuario:");
  const contrasena = prompt("Ingrese su contraseña:");
  return { usuario, contrasena };
}

function cargarDatosJSON() {
  return fetch("dictionary.json")
    .then((response) => response.json())
    .catch((error) => console.error("Error al cargar el diccionario:", error));
}

async function verificarCredenciales(usuario, contrasena, data) {
  if (!data.credentials || !Array.isArray(data.credentials)) {
    console.error("Estructura de datos incorrecta");
    return false;
  }

  const contrasenaEncriptada = await encriptarContrasena(contrasena);
  const usuarioValido = data.credentials.find((u) => u.username === usuario && u.password === contrasenaEncriptada);
  return usuarioValido !== undefined;
}

function guardarSesion(usuario) {
  const ahora = new Date();
  const expiracion = new Date(ahora.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 días
  const sesion = { usuario, expiracion: expiracion.toISOString() };
  localStorage.setItem("sesion", JSON.stringify(sesion));
}

function sesionValida() {
  const sesion = JSON.parse(localStorage.getItem("sesion"));
  if (!sesion) return false;
  const ahora = new Date();
  const expiracion = new Date(sesion.expiracion);
  return ahora < expiracion;
}

async function manejarBoton(event) {
  event.preventDefault();

  if (sesionValida()) {
    // Si la sesión es válida, no se solicitan credenciales
    manejarTraduccionEspanol();
    manejarTraduccionGlorp();
    return;
  }

  const { usuario, contrasena } = solicitarCredenciales();
  const data = await cargarDatosJSON();

  if (await verificarCredenciales(usuario, contrasena, data)) {
    guardarSesion(usuario);
    alert("Sesión iniciada correctamente.");
    manejarTraduccionEspanol();
    manejarTraduccionGlorp();
  } else {
    alert("Usuario o contraseña incorrectos o estructura de datos incorrecta.");
  }
}

document.getElementById("translate-glorp-es").addEventListener("click", manejarBoton);
document.getElementById("translate-es-glorp").addEventListener("click", manejarBoton);
