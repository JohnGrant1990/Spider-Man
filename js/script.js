const canvas = document.getElementById("escena");
const ctx = canvas.getContext("2d");

const hilosCanvas = document.getElementById("hilosNotaCanvas");
const hctx = hilosCanvas.getContext("2d");

const barraInferior = document.getElementById("barraInferior");
const colganteWrapper = document.getElementById("colganteWrapper");
const tarjetaNota = document.getElementById("tarjetaNota");
const textoNota = document.getElementById("textoNota");
const btnAbrir = document.getElementById("btnAbrir");
const btnCerrar = document.getElementById("btnCerrar");
const btnAudio = document.getElementById("btnAudio");

// ==========================================
// PERSONALIZACIÓN RÁPIDA
// ==========================================
const MENSAJE = "TE AMO";

const NOTA_EXTRA =
  "Se que es probable que ya no quieras estar conmigo pero no quiero quedarme sin decirte esto. Hace tiempo que estoy enamorado de ti, si te preguntas desde cuando, es desde 5to semestre. " +
  "Nunca voy conocer a otra mujer como tú, eres tan hermosa, estudiosa, inteligente, trabajadora, tu forma de ser me encanta, nunca me aburrira estar contigo y eres tan importante y especial para mi que no quiero estar con otra mujer que no seas tu. \n" +
  "Los recuerdos que tengo contigo no los cambiaria por nada del mundo, incluso quisiera volver a vivirlos. Puede que esto te parezca tonto pero sabes lo mucho que me gusta Spider-Man, pero algo malo que tiene él es que muchas veces tiene que alejarse del amor de su vida y a diferencia de él yo no quiero alejarme del mio. \n" +
  "Tu eres el amor de mi vida Paola, no tenemos que estar en caminos separados, tu eres mi camino y quiero que sepas que te amo con todo mi corazón y que quiero estar contigo para siempre, no quiero perderte nunca. No se que será de mi futuro pero lo que si se es que quiero que estés en él, quiero que seas mi compañera de vida y que estemos juntos para siempre. \n\n" +
  "Asi que Paola, crees que podamos darnos otra oportunidad y hacer las cosas bien?";

const ALTURA_NOTA_FACTOR = 0.56;
const RUTA_AUDIO = "song/Phillip Phillips - Gone, Gone, Gone.mp3";
// ==========================================

textoNota.textContent = NOTA_EXTRA;

// --- Música de fondo ---
const cancion = new Audio(RUTA_AUDIO);
cancion.loop = true;
cancion.volume = 0.35;
let audioIniciado = false;

function actualizarIconoAudio() {
  btnAudio.textContent = cancion.paused ? "🔇" : "🔊";
}

function intentarReproducirAudio() {
  if (audioIniciado) return;
  cancion
    .play()
    .then(() => {
      audioIniciado = true;
      actualizarIconoAudio();
    })
    .catch(() => {});
}

btnAudio.addEventListener("click", (e) => {
  e.stopPropagation();
  if (cancion.paused) {
    cancion
      .play()
      .then(() => {
        audioIniciado = true;
        actualizarIconoAudio();
      })
      .catch(() => {});
  } else {
    cancion.pause();
    actualizarIconoAudio();
  }
});

// --- Física de la nota colgante ---
let notaAbierta = false;
let notaPosY = -420;
let notaVelY = 0;
let notaAngulo = 0;
let notaVelAng = 0;

function destinoYAbierta() {
  const altoTarjeta = tarjetaNota.offsetHeight || 220;
  const centroDeseado = window.innerHeight * ALTURA_NOTA_FACTOR - altoTarjeta / 2;
  const minY = 85;
  const maxY = window.innerHeight - altoTarjeta - 85;
  return Math.max(minY, Math.min(centroDeseado, maxY));
}

function abrirNota(e) {
  e.stopPropagation();
  intentarReproducirAudio();
  notaAbierta = true;
  colganteWrapper.classList.add("activa");
  notaPosY = -tarjetaNota.offsetHeight - 30;
  notaVelY = 8;
  notaVelAng = (Math.random() > 0.5 ? 1 : -1) * 0.045;
}

function cerrarNota(e) {
  e.stopPropagation();
  notaAbierta = false;
  colganteWrapper.classList.remove("activa");
}

btnAbrir.addEventListener("click", abrirNota);
btnCerrar.addEventListener("click", cerrarNota);

tarjetaNota.addEventListener("pointerdown", (e) => {
  if (e.target === btnCerrar) return;
  const rect = tarjetaNota.getBoundingClientRect();
  const lado = e.clientX < rect.left + rect.width / 2 ? 1 : -1;
  notaVelY += 3.2;
  notaVelAng += lado * 0.025;
});

function actualizarFisicaNota() {
  const objetivoY = notaAbierta
    ? destinoYAbierta()
    : -(tarjetaNota.offsetHeight || 260) - 80;

  const rigidez = notaAbierta ? 0.052 : 0.08;
  const amortiguacion = notaAbierta ? 0.84 : 0.82;

  const fuerzaY = (objetivoY - notaPosY) * rigidez;
  notaVelY = (notaVelY + fuerzaY) * amortiguacion;
  notaPosY += notaVelY;

  const objetivoAng = notaAbierta
    ? Math.sin(Date.now() * 0.0022) * 0.013
    : 0;
  const fuerzaAng = (objetivoAng - notaAngulo) * 0.04;
  notaVelAng = (notaVelAng + fuerzaAng) * 0.9;
  notaAngulo += notaVelAng;

  const deg = (notaAngulo * 180) / Math.PI;
  colganteWrapper.style.transform = `translate3d(0, ${notaPosY.toFixed(1)}px, 0) rotate(${deg.toFixed(2)}deg)`;
}

function dibujarHilosNota() {
  hctx.clearRect(0, 0, hilosCanvas.width, hilosCanvas.height);

  const altoTarjeta = tarjetaNota.offsetHeight || 220;
  if (notaPosY + altoTarjeta <= 0) return;

  const rect = tarjetaNota.getBoundingClientRect();
  const offsetAnclaje = Math.min(36, rect.width * 0.14);

  const pIzq = { x: rect.left + offsetAnclaje, y: rect.top };
  const pDer = { x: rect.right - offsetAnclaje, y: rect.top };

  const topIzq = { x: pIzq.x - 14, y: 0 };
  const topDer = { x: pDer.x + 14, y: 0 };

  dibujarHiloColgante(topIzq.x, topIzq.y, pIzq.x, pIzq.y);
  dibujarHiloColgante(topDer.x, topDer.y, pDer.x, pDer.y);
}

function dibujarHiloColgante(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return;

  const nx = (-dy / dist) * 1.7;
  const ny = (dx / dist) * 1.7;

  hctx.save();
  hctx.strokeStyle = "rgba(255, 255, 255, 0.94)";
  hctx.shadowColor = "rgba(255, 30, 66, 0.45)";
  hctx.shadowBlur = 8;
  hctx.lineWidth = 1.4;

  hctx.beginPath();
  hctx.moveTo(x1 + nx, y1 + ny);
  hctx.lineTo(x2 + nx, y2 + ny);
  hctx.moveTo(x1 - nx, y1 - ny);
  hctx.lineTo(x2 - nx, y2 - ny);
  hctx.stroke();

  const pasos = Math.floor(dist / 10);
  hctx.lineWidth = 0.85;
  hctx.beginPath();
  for (let i = 1; i <= pasos; i++) {
    const f = i / (pasos + 1);
    const px = x1 + dx * f;
    const py = y1 + dy * f;
    hctx.moveTo(px - nx * 1.5, py - ny * 1.5);
    hctx.lineTo(px + nx * 1.5, py + ny * 1.5);
  }
  hctx.stroke();
  hctx.restore();
}

// --- Glifos vectoriales para letras tejidas ---
const GLIFOS = {
  A: [
    [[0.05, 1], [0.5, 0], [0.95, 1]],
    [[0.24, 0.62], [0.76, 0.62]]
  ],
  B: [
    [[0.15, 0], [0.15, 1]],
    [[0.15, 0], [0.72, 0], [0.85, 0.22], [0.7, 0.48], [0.15, 0.48]],
    [[0.7, 0.48], [0.88, 0.72], [0.72, 1], [0.15, 1]]
  ],
  C: [
    [[0.88, 0.18], [0.65, 0], [0.3, 0], [0.12, 0.28], [0.12, 0.72], [0.3, 1], [0.65, 1], [0.88, 0.82]]
  ],
  D: [
    [[0.15, 0], [0.15, 1]],
    [[0.15, 0], [0.65, 0], [0.88, 0.28], [0.88, 0.72], [0.65, 1], [0.15, 1]]
  ],
  E: [
    [[0.85, 0], [0.18, 0], [0.18, 1], [0.85, 1]],
    [[0.18, 0.5], [0.72, 0.5]]
  ],
  F: [
    [[0.85, 0], [0.18, 0], [0.18, 1]],
    [[0.18, 0.5], [0.72, 0.5]]
  ],
  G: [
    [[0.85, 0.18], [0.6, 0], [0.28, 0], [0.12, 0.28], [0.12, 0.72], [0.28, 1], [0.72, 1], [0.88, 0.78], [0.88, 0.54], [0.54, 0.54]]
  ],
  H: [
    [[0.18, 0], [0.18, 1]],
    [[0.82, 0], [0.82, 1]],
    [[0.18, 0.5], [0.82, 0.5]]
  ],
  I: [
    [[0.25, 0], [0.75, 0]],
    [[0.5, 0], [0.5, 1]],
    [[0.25, 1], [0.75, 1]]
  ],
  J: [
    [[0.78, 0], [0.78, 0.75], [0.58, 1], [0.32, 1], [0.15, 0.78]]
  ],
  K: [
    [[0.18, 0], [0.18, 1]],
    [[0.85, 0], [0.2, 0.52], [0.85, 1]]
  ],
  L: [
    [[0.2, 0], [0.2, 1], [0.85, 1]]
  ],
  M: [
    [[0.1, 1], [0.1, 0], [0.5, 0.58], [0.9, 0], [0.9, 1]]
  ],
  N: [
    [[0.15, 1], [0.15, 0], [0.85, 1], [0.85, 0]]
  ],
  O: [
    [[0.32, 0], [0.68, 0], [0.9, 0.25], [0.9, 0.75], [0.68, 1], [0.32, 1], [0.1, 0.75], [0.1, 0.25], [0.32, 0]]
  ],
  P: [
    [[0.18, 1], [0.18, 0], [0.72, 0], [0.88, 0.22], [0.72, 0.5], [0.18, 0.5]]
  ],
  Q: [
    [[0.32, 0], [0.68, 0], [0.88, 0.25], [0.88, 0.72], [0.68, 0.95], [0.32, 0.95], [0.12, 0.72], [0.12, 0.25], [0.32, 0]],
    [[0.58, 0.68], [0.92, 1]]
  ],
  R: [
    [[0.18, 1], [0.18, 0], [0.72, 0], [0.88, 0.22], [0.72, 0.48], [0.18, 0.48]],
    [[0.55, 0.48], [0.88, 1]]
  ],
  S: [
    [[0.84, 0.16], [0.62, 0], [0.3, 0], [0.14, 0.2], [0.24, 0.44], [0.76, 0.56], [0.86, 0.8], [0.68, 1], [0.32, 1], [0.14, 0.84]]
  ],
  T: [
    [[0.1, 0], [0.9, 0]],
    [[0.5, 0], [0.5, 1]]
  ],
  U: [
    [[0.16, 0], [0.16, 0.76], [0.36, 1], [0.64, 1], [0.84, 0.76], [0.84, 0]]
  ],
  V: [
    [[0.12, 0], [0.5, 1], [0.88, 0]]
  ],
  W: [
    [[0.08, 0], [0.28, 1], [0.5, 0.42], [0.72, 1], [0.92, 0]]
  ],
  X: [
    [[0.15, 0], [0.85, 1]],
    [[0.85, 0], [0.15, 1]]
  ],
  Y: [
    [[0.15, 0], [0.5, 0.5], [0.85, 0]],
    [[0.5, 0.5], [0.5, 1]]
  ],
  Z: [
    [[0.15, 0], [0.85, 0], [0.15, 1], [0.85, 1]]
  ]
};

let w, h, cx, cy, escalaCorazon;
let puntosCorazon = [];
let segmentosTexto = [];
let hilosEncima = [];

function trazarRutaCorazon(escala) {
  ctx.beginPath();
  for (let t = 0; t <= Math.PI * 2 + 0.04; t += 0.03) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    const px = cx + x * escala;
    const py = cy + y * escala;
    if (t === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function dibujarCorazonSpiderman(opacidad) {
  if (opacidad <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacidad;

  ctx.shadowColor = "rgba(225, 29, 72, 0.35)";
  ctx.shadowBlur = 22;

  trazarRutaCorazon(escalaCorazon);
  ctx.fillStyle = "#c82328";
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.lineWidth = Math.max(5, escalaCorazon * 0.48);
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#140709";
  ctx.stroke();

  ctx.clip();

  const centroX = cx;
  const centroY = cy + escalaCorazon * 0.8;
  const radioMax = escalaCorazon * 25;

  ctx.strokeStyle = "#140709";
  ctx.lineWidth = Math.max(2.6, escalaCorazon * 0.24);
  ctx.lineCap = "round";

  const totalRayos = 14;
  for (let i = 0; i < totalRayos; i++) {
    const ang = (i * Math.PI * 2) / totalRayos - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centroX, centroY);
    ctx.lineTo(
      centroX + Math.cos(ang) * radioMax,
      centroY + Math.sin(ang) * radioMax
    );
    ctx.stroke();
  }

  const anillos = [0.24, 0.48, 0.72, 0.96];
  anillos.forEach((frac) => {
    const r = radioMax * frac;
    ctx.beginPath();
    for (let i = 0; i < totalRayos; i++) {
      const a1 = (i * Math.PI * 2) / totalRayos - Math.PI / 2;
      const a2 = ((i + 1) * Math.PI * 2) / totalRayos - Math.PI / 2;
      const midA = (a1 + a2) / 2;

      const x1 = centroX + Math.cos(a1) * r;
      const y1 = centroY + Math.sin(a1) * r;
      const x2 = centroX + Math.cos(a2) * r;
      const y2 = centroY + Math.sin(a2) * r;

      const qx = centroX + Math.cos(midA) * (r * 1.11);
      const qy = centroY + Math.sin(midA) * (r * 1.11);

      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(qx, qy, x2, y2);
    }
    ctx.closePath();
    ctx.stroke();
  });

  // Visores más compactos y menos estirados horizontalmente
  const s = escalaCorazon;
  const puenteX = s * 1.6;
  const narizY = cy + s * 1.3;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#140709";
  ctx.lineWidth = Math.max(5, s * 0.46);
  ctx.lineJoin = "round";

  // Visor izquierdo
  ctx.beginPath();
  ctx.moveTo(cx - puenteX, narizY);
  ctx.bezierCurveTo(
    cx - s * 4.2,
    cy - s * 4.4,
    cx - s * 7.6,
    cy - s * 5.8,
    cx - s * 9.5,
    cy - s * 6.4
  );
  ctx.bezierCurveTo(
    cx - s * 8.3,
    cy - s * 0.6,
    cx - s * 5.4,
    cy + s * 1.9,
    cx - puenteX,
    narizY
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Visor derecho
  ctx.beginPath();
  ctx.moveTo(cx + puenteX, narizY);
  ctx.bezierCurveTo(
    cx + s * 4.2,
    cy - s * 4.4,
    cx + s * 7.6,
    cy - s * 5.8,
    cx + s * 9.5,
    cy - s * 6.4
  );
  ctx.bezierCurveTo(
    cx + s * 8.3,
    cy - s * 0.6,
    cx + s * 5.4,
    cy + s * 1.9,
    cx + puenteX,
    narizY
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function construirEscena() {
  w = canvas.width = hilosCanvas.width = window.innerWidth;
  h = canvas.height = hilosCanvas.height = window.innerHeight;
  cx = w / 2;
  cy = h / 2 - 14;

  escalaCorazon = Math.min(w, h) / 34;
  puntosCorazon = [];

  for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.05) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    puntosCorazon.push({
      x: cx + x * escalaCorazon,
      y: cy + y * escalaCorazon
    });
  }

  hilosEncima = [];
  const cantidadRadiales = 12;
  const cX = cx;
  const cY = cy + escalaCorazon * 5.2;

  for (let i = 0; i < cantidadRadiales; i++) {
    const idx = Math.floor((i / cantidadRadiales) * (puntosCorazon.length - 1));
    const pBorde = puntosCorazon[idx];
    hilosEncima.push({
      x1: cX,
      y1: cY,
      x2: pBorde.x,
      y2: pBorde.y
    });
  }

  const anillosFrac = [0.42, 0.75];
  anillosFrac.forEach((f) => {
    for (let i = 0; i < cantidadRadiales; i++) {
      const idx1 = Math.floor((i / cantidadRadiales) * (puntosCorazon.length - 1));
      const idx2 = Math.floor(((i + 1) / cantidadRadiales) * (puntosCorazon.length - 1));
      const p1 = puntosCorazon[idx1];
      const p2 = puntosCorazon[idx2];

      hilosEncima.push({
        x1: cX + (p1.x - cX) * f,
        y1: cY + (p1.y - cY) * f,
        x2: cX + (p2.x - cX) * f,
        y2: cY + (p2.y - cY) * f
      });
    }
  });

  segmentosTexto = [];
  const chars = MENSAJE.toUpperCase().split("");
  const anchoMaxTexto = escalaCorazon * 15.5;
  const espacioEntre = 0.28;
  const totalUnidades = chars.length + (chars.length - 1) * espacioEntre;
  const anchoLetra = Math.min(escalaCorazon * 2.4, anchoMaxTexto / totalUnidades);
  const altoLetra = anchoLetra * 1.35;
  const pasoLetra = anchoLetra * (1 + espacioEntre);
  const anchoTotal =
    chars.length * anchoLetra + (chars.length - 1) * (anchoLetra * espacioEntre);

  const inicioX = cx - anchoTotal / 2;
  const inicioY = cy + escalaCorazon * 4.5;

  chars.forEach((ch, idx) => {
    const glifo = GLIFOS[ch];
    if (!glifo) return;

    const offsetX = inicioX + idx * pasoLetra;
    const offsetY = inicioY;

    glifo.forEach((trazo) => {
      for (let i = 0; i < trazo.length - 1; i++) {
        const p1 = trazo[i];
        const p2 = trazo[i + 1];
        const x1 = offsetX + p1[0] * anchoLetra;
        const y1 = offsetY + p1[1] * altoLetra;
        const x2 = offsetX + p2[0] * anchoLetra;
        const y2 = offsetY + p2[1] * altoLetra;

        const dist = Math.hypot(x2 - x1, y2 - y1);
        const subPasos = Math.max(1, Math.ceil(dist / 14));

        for (let s = 0; s < subPasos; s++) {
          const t1 = s / subPasos;
          const t2 = (s + 1) / subPasos;
          segmentosTexto.push({
            x1: x1 + (x2 - x1) * t1,
            y1: y1 + (y2 - y1) * t1,
            x2: x1 + (x2 - x1) * t2,
            y2: y1 + (y2 - y1) * t2
          });
        }
      }
    });
  });
}

window.addEventListener("resize", construirEscena);
construirEscena();

let opacidadCorazon = 0;
let progresoTelarana = 0;
let progresoTexto = 0;
const telaranasDisparadas = [];

function trazarTelarana(
  x1,
  y1,
  x2,
  y2,
  alpha = 0.92,
  grosor = 1.35,
  separacion = 1.6
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.5) return;

  const nx = (-dy / dist) * separacion;
  const ny = (dx / dist) * separacion;

  ctx.save();
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.shadowColor = "rgba(255, 255, 255, 0.55)";
  ctx.shadowBlur = 7;
  ctx.lineWidth = grosor;

  ctx.beginPath();
  ctx.moveTo(x1 + nx, y1 + ny);
  ctx.lineTo(x2 + nx, y2 + ny);
  ctx.moveTo(x1 - nx, y1 - ny);
  ctx.lineTo(x2 - nx, y2 - ny);
  ctx.stroke();

  const pasos = Math.floor(dist / 8);
  ctx.lineWidth = grosor * 0.65;
  ctx.beginPath();
  for (let i = 1; i <= pasos; i++) {
    const f = i / (pasos + 1);
    const px = x1 + dx * f;
    const py = y1 + dy * f;
    ctx.moveTo(px - nx * 1.4, py - ny * 1.4);
    ctx.lineTo(px + nx * 1.4, py + ny * 1.4);
  }
  ctx.stroke();
  ctx.restore();
}

window.addEventListener("pointerdown", (e) => {
  intentarReproducirAudio();
  if (notaAbierta) return;

  const objetivo =
    puntosCorazon[Math.floor(Math.random() * puntosCorazon.length)];
  telaranasDisparadas.push({
    x1: e.clientX,
    y1: e.clientY,
    x2: objetivo.x,
    y2: objetivo.y,
    progreso: 0,
    alpha: 0.95
  });
});

function animar() {
  ctx.clearRect(0, 0, w, h);

  opacidadCorazon = Math.min(1, opacidadCorazon + 0.03);
  dibujarCorazonSpiderman(opacidadCorazon);

  const limiteHilos = Math.min(
    Math.floor(progresoTelarana),
    hilosEncima.length
  );
  for (let i = 0; i < limiteHilos; i++) {
    const hSeg = hilosEncima[i];
    trazarTelarana(hSeg.x1, hSeg.y1, hSeg.x2, hSeg.y2, 0.75, 1.15, 1.4);
  }

  if (progresoTelarana < hilosEncima.length) {
    progresoTelarana += 0.95;
  } else {
    const limiteTexto = Math.min(
      Math.floor(progresoTexto),
      segmentosTexto.length
    );
    for (let i = 0; i < limiteTexto; i++) {
      const seg = segmentosTexto[i];
      trazarTelarana(seg.x1, seg.y1, seg.x2, seg.y2, 0.98, 1.4, 1.65);
    }

    if (progresoTexto < segmentosTexto.length) {
      progresoTexto += 0.85;
    } else {
      barraInferior.classList.add("visible");
    }
  }

  for (let i = telaranasDisparadas.length - 1; i >= 0; i--) {
    const t = telaranasDisparadas[i];
    t.progreso = Math.min(1, t.progreso + 0.09);
    const curX = t.x1 + (t.x2 - t.x1) * t.progreso;
    const curY = t.y1 + (t.y2 - t.y1) * t.progreso;

    trazarTelarana(t.x1, t.y1, curX, curY, t.alpha, 1.3, 1.6);

    if (t.progreso >= 1) {
      t.alpha -= 0.014;
      if (t.alpha <= 0) telaranasDisparadas.splice(i, 1);
    }
  }

  actualizarFisicaNota();
  dibujarHilosNota();

  requestAnimationFrame(animar);
}

animar();