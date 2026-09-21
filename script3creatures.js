const mario = document.getElementById('mario');
const escenario = document.getElementById('escenario');

const cartel1 = document.getElementById('cartel-ml');
const cartel2 = document.getElementById('cartel-ml2');
const tituloInicial = document.getElementById('titulo-inicial');

const ANCHO_MUNDO = 3000;
const nivelSuelo = 50;

let marioX = 171;
let marioY = 230;

let velocidadY = 0;
let enElSuelo = false;
let direccion = 1;
let camaraX = 0;

let golpesBloque1 = 0;
let golpesBloque2 = 0;
let entrandoAlCastillo = false;

const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;

const teclas = {
    w: false,
    a: false,
    s: false,
    d: false
};

window.addEventListener('keydown', (e) => {
    const tecla = e.key.toLowerCase();

    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = true;
    }
});

window.addEventListener('keyup', (e) => {
    const tecla = e.key.toLowerCase();

    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = false;
    }
});

function actualizarCamara() {
    const anchoPantalla = window.innerWidth;

    camaraX = marioX - (anchoPantalla / 3);

    if (camaraX < 0) {
        camaraX = 0;
    }

    const maxCamaraX = Math.max(
        0,
        ANCHO_MUNDO - anchoPantalla
    );

    if (camaraX > maxCamaraX) {
        camaraX = maxCamaraX;
    }

    escenario.style.transform = `translateX(${-camaraX}px)`;
}

function ocultarTodosLosCarteles() {
    if (tituloInicial) {
        tituloInicial.classList.add('oculto');
    }

    if (cartel1) {
        cartel1.classList.add('oculto');
    }

    if (cartel2) {
        cartel2.classList.add('oculto');
    }
}

function activarBloque1() {
    ocultarTodosLosCarteles();

    if (!cartel1) {
        return;
    }

    cartel1.classList.remove('oculto');

    const contenido1 = document.getElementById('ml1-contenido1');
    const contenido2 = document.getElementById('ml1-contenido2');

    if (golpesBloque1 === 1) {
        if (contenido1) {
            contenido1.classList.remove('oculto');
        }

        if (contenido2) {
            contenido2.classList.add('oculto');
        }
    }

    if (golpesBloque1 === 2) {
        if (contenido1) {
            contenido1.classList.add('oculto');
        }

        if (contenido2) {
            contenido2.classList.remove('oculto');
        }
    }
}

function activarBloque2() {
    ocultarTodosLosCarteles();

    if (!cartel2) {
        return;
    }

    cartel2.classList.remove('oculto');

    const contenido1 = document.getElementById('ml2-contenido1');
    const contenido2 = document.getElementById('ml2-contenido2');

    if (golpesBloque2 === 1) {
        if (contenido1) {
            contenido1.classList.remove('oculto');
        }

        if (contenido2) {
            contenido2.classList.add('oculto');
        }
    }

    if (golpesBloque2 === 2) {
        if (contenido1) {
            contenido1.classList.add('oculto');
        }

        if (contenido2) {
            contenido2.classList.remove('oculto');
        }
    }
}

function resolverColisiones(siguienteX, siguienteY) {
    const obstaculos = document.querySelectorAll('.obstaculo');

    const marioWidth = 48;
    const marioHeight = 60;

    let resultado = {
        x: siguienteX,
        y: siguienteY,
        enPlataforma: false
    };

    obstaculos.forEach(elem => {
        const bLeft =
            parseInt(elem.style.left) || elem.offsetLeft;

        const bBottom =
            parseInt(elem.style.bottom) || 50;

        const bWidth = elem.offsetWidth;
        const bHeight = elem.offsetHeight;

        const solapeX =
            resultado.x + marioWidth > bLeft &&
            resultado.x < bLeft + bWidth;

        const solapeY =
            resultado.y + marioHeight > bBottom &&
            resultado.y < bBottom + bHeight;

        if (!solapeX || !solapeY) {
            return;
        }

        const previoSolapeX =
            marioX + marioWidth > bLeft &&
            marioX < bLeft + bWidth;

        if (!previoSolapeX) {
            if (marioX + marioWidth <= bLeft) {
                resultado.x = bLeft - marioWidth;
            } else if (marioX >= bLeft + bWidth) {
                resultado.x = bLeft + bWidth;
            }

            return;
        }

        if (
            velocidadY <= 0 &&
            marioY >= bBottom + bHeight - 20
        ) {
            resultado.y = bBottom + bHeight;
            velocidadY = 0;
            resultado.enPlataforma = true;
            return;
        }

        if (
            velocidadY > 0 &&
            marioY + marioHeight <= bBottom + 20
        ) {
            resultado.y = bBottom - marioHeight;
            velocidadY = 0;

            if (elem.id === 'bloque-mensaje-ml') {
                if (golpesBloque1 === 0) {
                    golpesBloque1 = 1;
                    activarBloque1();
                } else if (golpesBloque1 === 1) {
                    golpesBloque1 = 2;
                    activarBloque1();
                    elem.classList.add('usado');
                }
            }

            if (elem.id === 'bloque-mensaje-ml2') {
                if (golpesBloque2 === 0) {
                    golpesBloque2 = 1;
                    activarBloque2();
                } else if (golpesBloque2 === 1) {
                    golpesBloque2 = 2;
                    activarBloque2();
                    elem.classList.add('usado');
                }
            }
        }
    });

    return resultado;
}

function entrarAlCastillo() {
    if (entrandoAlCastillo) {
        return;
    }

    entrandoAlCastillo = true;

    teclas.a = false;
    teclas.d = false;
    teclas.w = false;

    mario.className = '';
    mario.classList.add('mario-saludando');

    setTimeout(() => {
        mario.classList.remove('mario-saludando');
        mario.classList.add('entrando-castillo');

        setTimeout(() => {
            window.location.href = 'nivel3A.html';
        }, 1700);

    }, 1200);
}

function actualizar() {
    let nuevoX = marioX;
    let moviendose = false;

    if (!entrandoAlCastillo) {
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
    }

    if (nuevoX < 0) {
        nuevoX = 0;
    }

    const anchoMario = 48;

    if (nuevoX > ANCHO_MUNDO - anchoMario) {
        nuevoX = ANCHO_MUNDO - anchoMario;
    }

    if (teclas.w && enElSuelo && !entrandoAlCastillo) {
        velocidadY = fuerzaSalto;
        enElSuelo = false;
    }

    let nuevoY = marioY + velocidadY;

    velocidadY -= gravedad;

    const colision = resolverColisiones(
        nuevoX,
        nuevoY
    );

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

    if (!entrandoAlCastillo) {
        mario.className = '';

        if (!enElSuelo) {
            mario.classList.add('mario-saltando');
        } else if (moviendose) {
            mario.classList.add('mario-corriendo');
        } else {
            mario.classList.add('mario-idle');
        }
    }

    mario.style.transform =
        `scaleX(${direccion * 1.2}) scaleY(1.2)`;

    mario.style.left = marioX + 'px';
    mario.style.bottom = marioY + 'px';

    const puertaCastilloX = 2860;
    const puertaCastilloAncho = 80;

    if (!entrandoAlCastillo &&
        marioX + 48 >= puertaCastilloX &&
        marioX <= puertaCastilloX + puertaCastilloAncho &&
        marioY <= 120
    ) {
        entrarAlCastillo();
    }

    actualizarCamara();

    requestAnimationFrame(actualizar);
}

mario.style.left = marioX + 'px';
mario.style.bottom = marioY + 'px';

mario.style.transform =
    'scaleX(1.2) scaleY(1.2)';

actualizar();