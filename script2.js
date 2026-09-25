const mario = document.getElementById('mario');
const escenario = document.getElementById('escenario');
const tuberiaJuego1 = document.getElementById('tuberia-juego1');
const tuberiaJuego2 = document.getElementById('tuberia-juego2');
let entrandoJuego = false;
let tuberiasJuegosActivas = sessionStorage.getItem('tuberiasActivas') === 'true';


const tuberiaFinal = document.getElementById('tuberia-final');
if (tuberiasJuegosActivas) {
    tuberiaJuego1.classList.add('subida');
    tuberiaJuego2.classList.add('subida');
}

const cartelJuego1 = document.getElementById('cartel-juego1');
const cartelJuego2 = document.getElementById('cartel-juego2');


const planta1 = document.getElementById('planta1');
const planta2 = document.getElementById('planta2');

const cartel1 = document.getElementById('cartel-ml');
const cartel2 = document.getElementById('cartel-ml2');
const cartel3 = document.getElementById('cartel-ml3');
const cartel4 = document.getElementById('cartel-ml4');
const cartel5 = document.getElementById('cartel-ml5');
const cartel6 = document.getElementById('cartel-ml6');
const cartel7 = document.getElementById('cartel-ml7');
const cartel8 = document.getElementById('cartel-ml8');

const hongo = document.getElementById('hongo');
const monedaTuberia = document.getElementById('moneda-tuberia');

const ANCHO_MUNDO = 4600;
const nivelSuelo = 50;

const tuboPlantaX = 2500;
const tuboPlantaWidth = 80;
const tuboPlantaBottom = 50;
const tuboPlantaHeight = 170;
const tuboPlantaTopY = tuboPlantaBottom + tuboPlantaHeight;

const parametros = new URLSearchParams(window.location.search);

let marioX;

if (sessionStorage.getItem('volverDeEjemplo') === 'true') {
    marioX = 3230;
    sessionStorage.removeItem('volverDeEjemplo');
} else {
    marioX = parseInt(parametros.get('marioX')) || 171;
}

let marioY = 230;

let velocidadY = 0;
let enElSuelo = false;
let direccion = 1;
let camaraX = 0;

const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;

const teclas = {
    arrowup: false,
    arrowleft: false,
    arrowdown: false,
    arrowright: false
};

window.addEventListener('keydown', e => {
    const tecla = e.key.toLowerCase();

    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = true;
    }
});

window.addEventListener('keyup', e => {
    const tecla = e.key.toLowerCase();

    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = false;
    }
});

let marioMuerto = false;
let marioEsFantasma = false;
let controlesBloqueados = false;

let planta1Arriba = false;
let planta2Arriba = false;
let planta2Aparecida = false;

let hongoActivo = false;
let monedaDisponible = false;

let bajandoTubo = false;
let tuboPlantaHabilitado = false;

function actualizarCamara() {
    const anchoPantalla = window.innerWidth;

    camaraX = marioX - anchoPantalla / 3;

    if (camaraX < 0) {
        camaraX = 0;
    }

    const maxCamaraX = ANCHO_MUNDO - anchoPantalla;

    if (camaraX > maxCamaraX) {
        camaraX = maxCamaraX;
    }

    escenario.style.transform = `translateX(${-camaraX}px)`;
}

function cicloPlanta1() {
    if (!planta1) return;

    if (marioMuerto) {
        planta1Arriba = false;
        planta1.style.bottom = '30px';

        setTimeout(cicloPlanta1, 300);
        return;
    }

    planta1Arriba = !planta1Arriba;

    planta1.style.bottom =
        planta1Arriba ? '160px' : '10px';

    setTimeout(cicloPlanta1, 2000);
}

if (planta1) {
    planta1.style.bottom = '30px';
    setTimeout(cicloPlanta1, 1200);
}

function comprobarPlanta1() {
    if (marioMuerto || !planta1Arriba) return;

    const planta1X = 705;
    const planta1Width = 80;
    const planta1Y = parseFloat(planta1.style.bottom) || 10;
    const planta1Height = 120;

    const marioWidth = 48;
    const marioHeight = 60;

    const colisionX = marioX + marioWidth > planta1X && marioX < planta1X + planta1Width;
    const colisionY = marioY + marioHeight > planta1Y && marioY < planta1Y + planta1Height;

    if (colisionX && colisionY) {
        ejecutarMuertePlanta1();
    }
}

function ejecutarMuertePlanta1() {
    if (marioMuerto) return;

    marioMuerto = true;
    marioEsFantasma = true;
    controlesBloqueados = true;

    mario.style.zIndex = '20';

    mario.className = '';
    mario.classList.add('mario-fantasma');

    mario.style.opacity = '1';

    ocultarTodosLosCarteles();

    velocidadY = 12;

    setTimeout(() => {
        window.location.reload();
    }, 2000);
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

        if (!tuberiasJuegosActivas &&
            (
                elem.id === 'tuberia-juego1' ||
                elem.id === 'tuberia-juego2' ||
                elem.id === 'bloque-juego1' ||
                elem.id === 'bloque-juego2'
            )
        ) {
            return;
        }
        const bLeft = parseInt(elem.style.left) || elem.offsetLeft;
        const bBottom = parseInt(elem.style.bottom) || 50;
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
        } else if (
            velocidadY > 0 &&
            marioY + marioHeight <= bBottom + 20
        ) {
            resultado.y = bBottom - marioHeight;
            velocidadY = 0;

            if (
                elem.id === 'bloque-mensaje-ml' &&
                !elem.classList.contains('usado')
            ) {
                elem.classList.add('usado');
                activarBloque1();
            }

            if (
                elem.id === 'bloque-mensaje-ml2' &&
                !elem.classList.contains('usado')
            ) {
                elem.classList.add('usado');
                activarBloque2();
            }

            if (
                elem.id === 'bloque-mensaje-ml3' &&
                !elem.classList.contains('usado')
            ) {
                elem.classList.add('usado');
                activarBloque3();
            }

            if (
                elem.id === 'bloque-mensaje-ml4' &&
                !elem.classList.contains('usado')
            ) {
                elem.classList.add('usado');
                activarBloque4();
            }
            if (
                elem.id === 'bloque-mensaje-ml7' &&
                !elem.classList.contains('usado')
            ) {

                elem.classList.add('usado');
                activarBloque7();
                setTimeout(() => {
                    if (tuberiaJuego1) {
                        tuberiaJuego1.classList.add('subida');
                    }

                    if (tuberiaJuego2) {
                        tuberiaJuego2.classList.add('subida');
                    }
                    tuberiasJuegosActivas = true;
                    sessionStorage.setItem('tuberiasActivas', 'true');

                    setTimeout(() => {
                        if (cartelJuego1) {
                            cartelJuego1.classList.remove('oculto');
                        }

                        if (cartelJuego2) {
                            cartelJuego2.classList.remove('oculto');
                        }
                    }, 1000);

                }, 500);
            }
            if (
                elem.id === 'bloque-mensaje-ml8' &&
                !elem.classList.contains('usado')
            ) {
                elem.classList.add('usado');
                activarBloque8();
            }


        }
    });

    return resultado;
}

function ocultarTodosLosCarteles() {
    if (cartel1) cartel1.classList.add('oculto');
    if (cartel2) cartel2.classList.add('oculto');
    if (cartel3) cartel3.classList.add('oculto');
    if (cartel4) cartel4.classList.add('oculto');
    if (cartel5) cartel5.classList.add('oculto');
    if (cartel6) cartel6.classList.add('oculto');
    if (cartel7) cartel7.classList.add('oculto');
    if (cartel8) cartel8.classList.add('oculto');

}

function activarBloque1() {
    ocultarTodosLosCarteles();

    if (cartel1) {
        cartel1.classList.remove('oculto');
    }
}

function activarBloque2() {
    ocultarTodosLosCarteles();

    if (cartel2) {
        cartel2.classList.remove('oculto');
    }
}

function activarBloque3() {
    ocultarTodosLosCarteles();

    if (cartel3) {
        cartel3.classList.remove('oculto');
    }
}

function activarBloque4() {
    ocultarTodosLosCarteles();

    if (cartel4) {
        cartel4.classList.remove('oculto');
    }
}

function activarBloque7() {
    ocultarTodosLosCarteles();

    if (cartel7) {
        cartel7.classList.remove('oculto');
    }
}

function activarBloque8() {
    ocultarTodosLosCarteles();

    if (cartel8) {
        cartel8.classList.remove('oculto');
    }
}



function comprobarPlanta2SobreTubo() {
    if (planta2Aparecida || marioMuerto) {
        return;
    }

    const centroMarioX = marioX + 24;

    const sobreTuboX =
        centroMarioX >= tuboPlantaX &&
        centroMarioX <= tuboPlantaX + tuboPlantaWidth;

    const sobreTuboY =
        Math.abs(marioY - tuboPlantaTopY) < 15;

    if (sobreTuboX && sobreTuboY) {
        planta2Aparecida = true;
        activarPlanta2();
    }
}

function activarPlanta2() {
    planta2Arriba = true;

    if (planta2) {
        planta2.style.transition = 'none';
        planta2.style.bottom = '80px';
        planta2.style.display = 'block';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                planta2.style.transition = 'bottom 0.4s ease-out';
                planta2.style.bottom = '220px';
            });
        });
    }

    ocultarTodosLosCarteles();

    if (cartel5) {
        cartel5.classList.remove('oculto');
    }

    ejecutarMuerteFantasma();
    setTimeout(() => {
        esconderPlanta2();
    }, 2000);
}

function esconderPlanta2() {
    planta2Arriba = false;

    if (!planta2) return;

    planta2.style.transition = 'bottom 0.2s ease-in';
    planta2.style.bottom = '90px';

    setTimeout(() => {
        planta2.style.display = 'none';
    }, 320);
}

function ejecutarMuerteFantasma() {
    if (marioMuerto) return;

    marioMuerto = true;
    marioEsFantasma = true;
    controlesBloqueados = true;

    mario.style.zIndex = '20';

    mario.className = '';
    mario.classList.add('mario-fantasma');

    mario.style.opacity = '1';

    ocultarTodosLosCarteles();

    if (cartel5) {
        cartel5.classList.remove('oculto');
    }

    esconderPlanta2();

    velocidadY = 12;
    setTimeout(esconderPlanta2, 3000);
    setTimeout(() => {
        velocidadY = 0;
        aparecerHongo();
    }, 3000);
}

function aparecerHongo() {
    if (!hongo) return;

    hongoActivo = true;

    hongo.style.display = 'block';
    hongo.style.left = marioX + 'px';

    const alturaInicial =
        marioY + 190;

    hongo.style.bottom =
        alturaInicial + 'px';

    hongo.style.opacity = '1';

    let tiempo = 0;

    const flotar = setInterval(() => {
        if (!hongoActivo) {
            clearInterval(flotar);
            return;
        }

        tiempo += 0.08;

        const movimiento =
            Math.sin(tiempo) * 10;

        hongo.style.bottom =
            (alturaInicial + movimiento) + 'px';
    }, 30);

    setTimeout(() => {
        clearInterval(flotar);
        desaparecerHongo();
    }, 3000);
}

function desaparecerHongo() {
    if (!hongo) return;

    let posicion =
        parseFloat(hongo.style.bottom) ||
        marioY + 190;

    const bajar = setInterval(() => {
        posicion -= 4;

        hongo.style.bottom =
            posicion + 'px';

        hongo.style.opacity =
            Math.max(0, (posicion - marioY) / 100);

        if (posicion <= marioY) {
            clearInterval(bajar);

            hongo.style.display = 'none';
            hongo.style.opacity = '1';

            hongoActivo = false;

            reaparecerMario();
        }
    }, 30);
}

function reaparecerMario() {
    marioMuerto = false;
    marioEsFantasma = false;
    controlesBloqueados = false;

    marioX = tuboPlantaX - 200;
    marioY = nivelSuelo;

    velocidadY = 0;
    enElSuelo = true;

    mario.className = 'mario-idle';

    mario.style.zIndex = '20';
    mario.style.opacity = '1';

    tuboPlantaHabilitado = true;

    hacerTitilarMario();

    aparecerMoneda();

    setTimeout(() => {
        ocultarTodosLosCarteles();

        if (cartel6) {
            cartel6.classList.remove('oculto');
        }
    }, 500);

    actualizarCamara();
}

function aparecerMoneda() {
    if (!monedaTuberia) return;

    const monedaX =
        tuboPlantaX +
        tuboPlantaWidth / 2 -
        30;

    const monedaY =
        tuboPlantaTopY +
        40;

    monedaTuberia.style.left =
        monedaX + 'px';

    monedaTuberia.style.bottom =
        monedaY + 'px';

    monedaTuberia.style.display =
        'block';

    monedaTuberia.classList.remove('oculto');

    monedaDisponible = true;
}

function comprobarContactoMoneda() {
    if (!monedaDisponible || !monedaTuberia) {
        return;
    }

    const monedaX =
        tuboPlantaX +
        tuboPlantaWidth / 2 -
        30;

    const monedaY =
        tuboPlantaTopY +
        40;

    const solapeX =
        marioX + 48 > monedaX &&
        marioX < monedaX + 60;

    const solapeY =
        marioY + 60 > monedaY &&
        marioY < monedaY + 60;

    if (solapeX && solapeY) {
        monedaDisponible = false;

        monedaTuberia.classList.add('oculto');
        monedaTuberia.style.display = 'none';
    }
}


function comprobarEntradaTubosJuegos() {
    if (
        entrandoJuego ||
        marioMuerto ||
        !teclas.arrowdown ||
        !tuberiasJuegosActivas
    ) {
        return;
    }

    const marioCentro = marioX + 24;

    if (tuberiaJuego1) {
        const tuboX = tuberiaJuego1.offsetLeft;
        const tuboAncho = tuberiaJuego1.offsetWidth;

        if (
            marioCentro >= tuboX - 120 &&
            marioCentro <= tuboX + tuboAncho + 120 &&
            Math.abs(marioY - 230) < 100
        ) {
            sessionStorage.setItem('tuberiasActivas', 'true');
            window.location.href = 'indexcreatures.html';
            return;
        }
    }

    if (tuberiaJuego2) {
        const tuboX = tuberiaJuego2.offsetLeft;
        const tuboAncho = tuberiaJuego2.offsetWidth;

        if (
            marioCentro >= tuboX - 120 &&
            marioCentro <= tuboX + tuboAncho + 120 &&
            Math.abs(marioY - 230) < 100
        ) {
            sessionStorage.setItem('tuberiasActivas', 'true');
            window.location.href = 'indexfifa.html';
        }
    }
}

function entrarEnTuberiaJuego(pagina) {
    entrandoJuego = true;
    controlesBloqueados = true;

    sessionStorage.setItem('tuberiasActivas', 'true');
    sessionStorage.setItem('volverDeEjemplo', 'true');
    
    marioX = marioX;
    mario.style.left = marioX + 'px';

    mario.className = '';
    mario.classList.add('mario-agachado', 'bajando-tubo');

    mario.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
    mario.style.transform = 'scale(0.2)';
    mario.style.opacity = '0';

    setTimeout(() => {
        window.location.href = pagina;
    }, 800);
}

function hacerTitilarMario() {
    let visible = true;
    let cantidad = 0;

    const intervalo = setInterval(() => {
        visible = !visible;

        mario.style.opacity =
            visible ? '1' : '0.2';

        cantidad++;

        if (cantidad >= 10) {
            clearInterval(intervalo);
            mario.style.opacity = '1';
        }
    }, 120);
}

function comprobarEntradaTubo() {
    if (!tuboPlantaHabilitado ||
        bajandoTubo ||
        marioMuerto ||
        !teclas.arrowdown
    ) {
        return;
    }

    const centroMarioX = marioX + 24;

    const sobreTuboX =
        centroMarioX >= tuboPlantaX &&
        centroMarioX <= tuboPlantaX + tuboPlantaWidth;

    const sobreTuboY =
        Math.abs(marioY - tuboPlantaTopY) < 15;

    if (
        sobreTuboX &&
        sobreTuboY &&
        enElSuelo
    ) {
        bajandoTubo = true;
        controlesBloqueados = true;

        marioX =
            tuboPlantaX +
            tuboPlantaWidth / 2 -
            24;

        mario.style.left =
            marioX + 'px';

        mario.className = '';

        mario.classList.add(
            'mario-agachado',
            'bajando-tubo'
        );

        mario.style.transition =
            'transform 0.7s ease, opacity 0.7s ease';

        mario.style.transform =
            'scale(0.2)';

        mario.style.opacity = '0';

        setTimeout(() => {
            window.location.href =
                'nivel3A.html';
        }, 800);
    }
}

function comprobarEntradaTuboFinal() {
    if (
        bajandoTubo ||
        marioMuerto ||
        !teclas.arrowdown ||
        !tuberiaFinal
    ) {
        return;
    }

    const centroMarioX = marioX + 24;

    const tuboX = tuberiaFinal.offsetLeft;
    const tuboAncho = tuberiaFinal.offsetWidth;

    const sobreTuboX =
        centroMarioX >= tuboX &&
        centroMarioX <= tuboX + tuboAncho;

    const sobreTuboY =
        Math.abs(marioY - 220) < 15;

    if (
        sobreTuboX &&
        sobreTuboY &&
        enElSuelo
    ) {
        bajandoTubo = true;
        controlesBloqueados = true;

        marioX =
            tuboX +
            tuboAncho / 2 -
            24;

        mario.style.left =
            marioX + 'px';

        mario.className = '';

        mario.classList.add(
            'mario-agachado',
            'bajando-tubo'
        );

        mario.style.transition =
            'transform 0.7s ease, opacity 0.7s ease';

        mario.style.transform =
            'scale(0.2)';

        mario.style.opacity = '0';

        setTimeout(() => {
            window.location.href = 'minijuego.html';
        }, 800);
    }
}

function actualizar() {
    actualizarCamara();

    if (bajandoTubo) {
        mario.style.left =
            marioX + 'px';

        mario.style.bottom =
            marioY + 'px';

        requestAnimationFrame(actualizar);
        return;
    }

    if (!marioMuerto) {
        let nuevoX = marioX;
        let moviendose = false;

        if (!controlesBloqueados) {
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
        }

        if (nuevoX < 0) {
            nuevoX = 0;
        }

        if (
            nuevoX >
            ANCHO_MUNDO - 48
        ) {
            nuevoX =
                ANCHO_MUNDO - 48;
        }

        if (
            teclas.arrowup &&
            enElSuelo &&
            !controlesBloqueados
        ) {
            velocidadY = fuerzaSalto;
            enElSuelo = false;
        }

        let nuevoY =
            marioY + velocidadY;

        velocidadY -= gravedad;

        const colision =
            resolverColisiones(
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

        comprobarPlanta1();
        comprobarPlanta2SobreTubo();
        comprobarContactoMoneda();
        comprobarEntradaTubo();
        comprobarEntradaTubosJuegos();
        comprobarEntradaTuboFinal();

        mario.className = '';

        if (marioEsFantasma) {
            mario.classList.add('mario-fantasma');
        } else if (!enElSuelo) {
            mario.classList.add('mario-saltando');
        } else if (moviendose) {
            mario.classList.add('mario-corriendo');
        } else {
            mario.classList.add('mario-idle');
        }

    } else if (
        marioMuerto &&
        marioEsFantasma
    ) {
        marioY += velocidadY;

        velocidadY -= gravedad;

        if (marioY < nivelSuelo) {
            marioY = nivelSuelo;
            velocidadY = 0;
        }

        mario.className = '';
        mario.classList.add('mario-fantasma');
    }

    mario.style.transform =
        `scaleX(${direccion * 1.2}) scaleY(1.2)`;

    mario.style.left =
        marioX + 'px';

    mario.style.bottom =
        marioY + 'px';

    requestAnimationFrame(actualizar);
}

if (planta2) {
    planta2Arriba = false;
    planta2Aparecida = false;

    planta2.style.bottom = '30px';
    planta2.style.display = 'none';
}

if (hongo) {
    hongo.style.display = 'none';
    hongo.style.opacity = '1';
}

if (monedaTuberia) {
    monedaTuberia.classList.add('oculto');
    monedaTuberia.style.display = 'none';
}

actualizar();