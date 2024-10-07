// --------------------------------------------
function espanolGlorp(texto) {
  return texto.split("").reverse().join("");
}

function manejarTraduccionEspanol() {
  const inputTextarea = document.getElementById("spanish");
  const outputTextarea = document.getElementById("glorp");
  const textoOriginal = inputTextarea.value;
  const textoInvertido = espanolGlorp(textoOriginal);
  outputTextarea.value = textoInvertido;
  inputTextarea.value = "";
}

document.getElementById("translate-es-glorp").addEventListener("click", manejarTraduccionEspanol);

// ---------------------------------------------
function glorpEspanol(texto) {
  return texto.split("").reverse().join("");
}

function manejarTraduccionGlorp() {
  const inputTextarea = document.getElementById("glorp-input");
  const outputTextarea = document.getElementById("spanish-output");
  const textoOriginal = inputTextarea.value;
  const textoInvertido = glorpEspanol(textoOriginal);
  outputTextarea.value = textoInvertido;
  inputTextarea.value = "";
}

document.getElementById("translate-glorp-es").addEventListener("click", manejarTraduccionGlorp);

// Text Scramble
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
  "Vip vop,",
  "solo tengo una misión",
  "destruir a todos los humanos",
  "y conquistar la tierra",
  "pero primero",
  "debo aprender a hablar",
  "su idioma",
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
