// Selección de elementos del DOM
const mario = document.getElementById('mario');
const instruccionesTeclas = document.getElementById('instrucciones-teclas');
const modalML = document.getElementById('modal-ml');
const tuboEntrada = document.getElementById('tubo-entrada');
const juegoContainer = document.getElementById('juego');

// Configuración de física y posición
const nivelSuelo = 50;
let marioX = 40;
let marioY = nivelSuelo;
let velocidadY = 0;
let enElSuelo = true;
let direccion = 1;
let bajandoTubo = false;

const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;

// Control de teclas WASD
const teclas = { w: false, a: false, s: false, d: false };

window.addEventListener('keydown', (e) => {
    const tecla = e.key.toLowerCase();
    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = true;
        if (instruccionesTeclas) {
            instruccionesTeclas.classList.add('oculto');
        }
    }
});

window.addEventListener('keyup', (e) => {
    const tecla = e.key.toLowerCase();
    if (teclas.hasOwnProperty(tecla)) teclas[tecla] = false;
});

// Animación de rebote para bloques normales
function rebotarBloque(bloque) {
    const bottomOriginal = parseInt(bloque.style.bottom) || 190;
    bloque.style.bottom = (bottomOriginal + 5) + 'px';
    setTimeout(() => {
        bloque.style.bottom = bottomOriginal + 'px';
    }, 100);
}

// Sistema de colisiones y golpes
function resolverColisiones(siguienteX, siguienteY) {
    const obstaculos = document.querySelectorAll('.obstaculo');
    const marioWidth = 48;
    const marioHeight = 60;

    let resultado = { x: siguienteX, y: siguienteY, enPlataforma: false };

    obstaculos.forEach(elem => {
        // Ignorar la tubería si todavía no ha emergido
        if (elem.id === 'tubo-entrada' && !elem.classList.contains('visible')) {
            return;
        }

        // Leer posiciones numéricas
        const bLeft = parseInt(elem.style.left) || elem.offsetLeft || 0;
        const bBottom = parseInt(elem.style.bottom) || 0;
        const bWidth = elem.offsetWidth;
        const bHeight = elem.offsetHeight;

        const solapeX = (resultado.x + marioWidth > bLeft) && (resultado.x < bLeft + bWidth);
        const solapeY = (resultado.y + marioHeight > bBottom) && (resultado.y < bBottom + bHeight);

        if (solapeX && solapeY) {
            const previoSolapeX = (marioX + marioWidth > bLeft) && (marioX < bLeft + bWidth);

            if (previoSolapeX) {
                // Golpe de cabeza contra un bloque
                if (velocidadY > 0 && marioY + marioHeight <= bBottom + 12) {
                    resultado.y = bBottom - marioHeight;
                    velocidadY = 0;

                    // GOLPE AL BLOQUE ESPECIAL (ML)
                    if (elem.id === 'bloque-mensaje-ml' && !elem.classList.contains('usado')) {
                        elem.classList.add('usado');

                        if (modalML) {
                            modalML.classList.remove('oculto');
                        }

                        if (tuboEntrada) {
                            tuboEntrada.classList.add('visible');
                            tuboEntrada.style.bottom = '50px'; // Cambia la posición inline a 50px para que suba y JS la detecte
                        }
                    }
                } else if (elem.classList.contains('bloque')) {
                    rebotarBloque(elem);
                }
            } else {
                // Bloqueo lateral (paredes de bloques/cañería)
                if (marioX + marioWidth <= bLeft) {
                    resultado.x = bLeft - marioWidth;
                } else if (marioX >= bLeft + bWidth) {
                    resultado.x = bLeft + bWidth;
                }
            }
        } else if (solapeX && velocidadY <= 0 && marioY >= bBottom + bHeight - 20) {
            // Aterrizaje sobre un bloque o cañería
            resultado.y = bBottom + bHeight;
            velocidadY = 0;
            resultado.enPlataforma = true;
        }
    });

    return resultado;
}

// Lógica para bajar por la tubería
function comprobarEntradaTubo() {
    if (!tuboEntrada || bajandoTubo || !tuboEntrada.classList.contains('visible')) return;

    // Obtener dimensiones reales del elemento en pantalla
    const tuboLeft = tuboEntrada.offsetLeft;
    const tuboWidth = tuboEntrada.offsetWidth;
    const tuboHeight = tuboEntrada.offsetHeight;

    // Altura de la boca del tubo considerando el nivel del suelo (50px)
    const tuboBottom = parseInt(tuboEntrada.style.bottom) || 50;
    const tuboTopY = tuboBottom + tuboHeight;

    // Detectar si el centro de Mario (x) está sobre la boca del tubo
    const centroMarioX = marioX + 24;
    const sobreTuboX = (centroMarioX >= tuboLeft) && (centroMarioX <= tuboLeft + tuboWidth);

    // Detectar si los pies de Mario están cerca de la parte superior del tubo
    const sobreTuboY = Math.abs(marioY - tuboTopY) <= 20;

    // Si está alineado y se presiona 'S'
    if (sobreTuboX && sobreTuboY && teclas.s) {
        bajandoTubo = true;

        mario.className = '';
        mario.classList.add('mario-agachado', 'bajando-tubo');

        // Centrar exactamente a Mario respecto a la tubería
        marioX = tuboLeft + (tuboWidth / 2) - 24;
        mario.style.left = marioX + 'px';

        // Redirigir al nivel 2 tras completarse la animación
        setTimeout(() => {
            window.location.href = "nivel2.html";
        }, 800);
    }
}

// Bucle principal de actualización del juego
function actualizar() {
    if (bajandoTubo) return;

    let nuevoX = marioX;
    let moviendose = false;

    // Movimiento Horizontal
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

    // Límites laterales de la pantalla
    const anchoPantalla = juegoContainer ? juegoContainer.offsetWidth : window.innerWidth;
    const limiteIzquierdo = 0;
    const limiteDerecho = anchoPantalla - 48;

    if (nuevoX < limiteIzquierdo) nuevoX = limiteIzquierdo;
    if (nuevoX > limiteDerecho) nuevoX = limiteDerecho;

    // Salto
    if (teclas.w && enElSuelo) {
        velocidadY = fuerzaSalto;
        enElSuelo = false;
    }

    let nuevoY = marioY + velocidadY;
    velocidadY -= gravedad;

    // Resolver colisiones con plataformas y bloques
    const colision = resolverColisiones(nuevoX, nuevoY);
    marioX = colision.x;
    marioY = colision.y;

    if (colision.enPlataforma) {
        enElSuelo = true;
        velocidadY = 0;
    } else if (marioY <= nivelSuelo) {
        marioY = nivelSuelo;
        velocidadY = 0;
        enElSuelo = true;
    } else {
        enElSuelo = false;
    }

    // Aplicar clases de animación visual
    mario.className = '';
    if (!enElSuelo) {
        mario.classList.add('mario-saltando');
    } else if (moviendose) {
        mario.classList.add('mario-corriendo');
    } else {
        mario.classList.add('mario-idle');
    }

    // Renderizar posición y dirección
    mario.style.transform = `scaleX(${direccion * 1.2}) scaleY(1.2)`;
    mario.style.left = marioX + 'px';
    mario.style.bottom = marioY + 'px';

    comprobarEntradaTubo();

    requestAnimationFrame(actualizar);
}

// Iniciar bucle del juego
actualizar();