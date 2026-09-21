const mario = document.getElementById('mario');
const juegoContainer = document.getElementById('juego');

// Configuración de posiciones y física
const nivelSuelo = 200;
let marioX = 300;
let marioY = nivelSuelo;
let velocidadY = 0;
let enElSuelo = true;
let direccion = 1;

const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;

// Únicamente teclas A, S, W, D
const teclas = { a: false, s: false, w: false, d: false };

// Detección de teclas presionadas
window.addEventListener('keydown', (e) => {
    const tecla = e.key.toLowerCase();

    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = true;
    }

    // Pasar de nivel/pantalla con Enter
    if (e.key === 'Enter') {
        window.location.href = "index.html"; // Cambia al nombre de tu siguiente archivo HTML
    }
});

// Detección cuando se suelta la tecla
window.addEventListener('keyup', (e) => {
    const tecla = e.key.toLowerCase();
    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = false;
    }
});

// Bucle principal del juego
function actualizar() {
    let moviendose = false;
    let nuevoX = marioX;

    // Movimiento Horizontal (A para izquierda, D para derecha)
    if (teclas.a) {
        nuevoX -= velocidadX;
        direccion = -1;
        moviendose = true;
    }
    if (teclas.d) {
        nuevoX += velocidadX;
        direccion = 1;
        moviendose = true;
    }

    // Limitar movimiento a los bordes de la pantalla
    const anchoPantalla = juegoContainer ? juegoContainer.offsetWidth : window.innerWidth;
    const limiteIzquierdo = 200;
    const limiteDerecho = anchoPantalla - 200; // 48px es el ancho de Mario

    if (nuevoX < limiteIzquierdo) nuevoX = limiteIzquierdo;
    if (nuevoX > limiteDerecho) nuevoX = limiteDerecho;

    marioX = nuevoX;

    // Salto con la tecla W
    if (teclas.w && enElSuelo) {
        velocidadY = fuerzaSalto;
        enElSuelo = false;
    }

    // Aplicar física de salto y gravedad
    marioY += velocidadY;
    velocidadY -= gravedad;

    // Control del nivel del suelo
    if (marioY <= nivelSuelo) {
        marioY = nivelSuelo;
        velocidadY = 0;
        enElSuelo = true;
    } else {
        enElSuelo = false;
    }

    // Asignación de clases según la acción
    mario.className = '';
    if (!enElSuelo) {
        mario.classList.add('mario-saltando');
    } else if (teclas.s) {
        mario.classList.add('mario-agachado');
    } else if (moviendose) {
        mario.classList.add('mario-corriendo');
    } else {
        mario.classList.add('mario-idle');
    }

    // Actualización de posición e inclinación del sprite
    mario.style.transform = `scaleX(${direccion * 1.2}) scaleY(1.2)`;
    mario.style.left = marioX + 'px';
    mario.style.bottom = marioY + 'px';

    requestAnimationFrame(actualizar);
}

actualizar();

document.addEventListener("keydown", function(event) {
    if (event.key === 'Enter') {
        window.location.href = "index.html";
    }
});
