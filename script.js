const mario = document.getElementById('mario');
const instruccionesTeclas = document.getElementById('instrucciones-teclas');
const modalML = document.getElementById('modal-ml');
const tuboEntrada = document.getElementById('tubo-entrada');
const juegoContainer = document.getElementById('juego');

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

const teclas = {
    arrowup: false,
    arrowleft: false,
    arrowdown: false,
    arrowright: false
};

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

function rebotarBloque(bloque) {
    const bottomOriginal = parseInt(bloque.style.bottom) || 190;
    bloque.style.bottom = (bottomOriginal + 5) + 'px';
    setTimeout(() => {
        bloque.style.bottom = bottomOriginal + 'px';
    }, 100);
}

function resolverColisiones(siguienteX, siguienteY) {
    const obstaculos = document.querySelectorAll('.obstaculo');
    const marioWidth = 48;
    const marioHeight = 60;

    let resultado = { x: siguienteX, y: siguienteY, enPlataforma: false };

    obstaculos.forEach(elem => {
        if (elem.id === 'tubo-entrada' && !elem.classList.contains('visible')) {
            return;
        }

        const bLeft = parseInt(elem.style.left) || elem.offsetLeft || 0;
        const bBottom = parseInt(elem.style.bottom) || 0;
        const bWidth = elem.offsetWidth;
        const bHeight = elem.offsetHeight;

        const solapeX = (resultado.x + marioWidth > bLeft) && (resultado.x < bLeft + bWidth);
        const solapeY = (resultado.y + marioHeight > bBottom) && (resultado.y < bBottom + bHeight);

        if (solapeX && solapeY) {
            const previoSolapeX = (marioX + marioWidth > bLeft) && (marioX < bLeft + bWidth);

            if (previoSolapeX) {
                if (velocidadY > 0 && marioY + marioHeight <= bBottom + 12) {
                    resultado.y = bBottom - marioHeight;
                    velocidadY = 0;

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
                if (marioX + marioWidth <= bLeft) {
                    resultado.x = bLeft - marioWidth;
                } else if (marioX >= bLeft + bWidth) {
                    resultado.x = bLeft + bWidth;
                }
            }
        } else if (solapeX && velocidadY <= 0 && marioY >= bBottom + bHeight - 20) {
            resultado.y = bBottom + bHeight;
            velocidadY = 0;
            resultado.enPlataforma = true;
        }
    });

    return resultado;
}

function comprobarEntradaTubo() {
    if (!tuboEntrada || bajandoTubo || !tuboEntrada.classList.contains('visible')) return;

    const tuboLeft = tuboEntrada.offsetLeft;
    const tuboWidth = tuboEntrada.offsetWidth;
    const tuboHeight = tuboEntrada.offsetHeight;

    const tuboBottom = parseInt(tuboEntrada.style.bottom) || 50;
    const tuboTopY = tuboBottom + tuboHeight;

    const centroMarioX = marioX + 24;
    const sobreTuboX = (centroMarioX >= tuboLeft) && (centroMarioX <= tuboLeft + tuboWidth);

    const sobreTuboY = Math.abs(marioY - tuboTopY) <= 20;

    if (sobreTuboX && sobreTuboY && teclas.arrowdown) {
        bajandoTubo = true;

        mario.className = '';
        mario.classList.add('mario-agachado', 'bajando-tubo');

        marioX = tuboLeft + (tuboWidth / 2) - 24;
        mario.style.left = marioX + 'px';

        setTimeout(() => {
            window.location.href = "nivel3A.html";
        }, 800);
    }
}

function actualizar() {
    if (bajandoTubo) return;

    let nuevoX = marioX;
    let moviendose = false;

    if (teclas.arrowleft) {
        nuevoX -= velocidadX;
        direccion = -1;
        moviendose = true;
    }
    if (teclas.arrowright) {
        nuevoX += velocidadX;
        direccion = 1;
        moviendose = true;
    }

    const anchoPantalla = juegoContainer ? juegoContainer.offsetWidth : window.innerWidth;
    const limiteIzquierdo = 0;
    const limiteDerecho = anchoPantalla - 48;

    if (nuevoX < limiteIzquierdo) nuevoX = limiteIzquierdo;
    if (nuevoX > limiteDerecho) nuevoX = limiteDerecho;

    if (teclas.arrowup && enElSuelo) {
        velocidadY = fuerzaSalto;
        enElSuelo = false;
    }

    let nuevoY = marioY + velocidadY;
    velocidadY -= gravedad;

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

    mario.className = '';
    if (!enElSuelo) {
        mario.classList.add('mario-saltando');
    } else if (moviendose) {
        mario.classList.add('mario-corriendo');
    } else {
        mario.classList.add('mario-idle');
    }

    mario.style.transform = `scaleX(${direccion * 1.2}) scaleY(1.2)`;
    mario.style.left = marioX + 'px';
    mario.style.bottom = marioY + 'px';

    comprobarEntradaTubo();

    requestAnimationFrame(actualizar);
}

actualizar();
