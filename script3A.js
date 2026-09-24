const mario = document.getElementById('mario');
const escenario = document.getElementById('escenario');

const cartel1 = document.getElementById('cartel-ml');
const cartel2 = document.getElementById('cartel-ml2');
const cartel3 = document.getElementById('cartel-ml3');
const cartel4 = document.getElementById('cartel-ml4');
const cartel5 = document.getElementById('cartel-ml5');
const cartel6 = document.getElementById('cartel-ml6');
const tituloInicial = document.getElementById('titulo-inicial');
const cartel7 = document.getElementById('cartel7');

const tuberia = document.getElementById('tuberia');

const ANCHO_MUNDO = 2300;
const nivelSuelo = 50;

const hongo = document.getElementById('hongo');

let entrandoTuberia = false;

let marioX = 171;
let marioY = 230;

let velocidadY = 0;
let enElSuelo = false;
let direccion = 1;

let camaraX = 0;
let cartel7Activado = false;

const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;

const teclas = {
    arrowup: false,
    arrowleft: false,
    arrowright: false,
    arrowdown: false
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

function ocultarTituloInicial() {

    if (tituloInicial) {
        tituloInicial.classList.add('oculto');
    }
}

function actualizarCamara() {

    const anchoPantalla = window.innerWidth;

    camaraX =
        marioX -
        (anchoPantalla / 3);

    if (camaraX < 0) {
        camaraX = 0;
    }

    const maxCamaraX =
        Math.max(
            0,
            ANCHO_MUNDO -
            anchoPantalla
        );

    if (camaraX > maxCamaraX) {
        camaraX = maxCamaraX;
    }

    escenario.style.transform =
        `translateX(${-camaraX}px)`;
}

function resolverColisiones(
    siguienteX,
    siguienteY
) {

    const obstaculos =
        document.querySelectorAll(
            '.obstaculo'
        );

    const marioWidth = 48;
    const marioHeight = 60;

    let resultado = {
        x: siguienteX,
        y: siguienteY,
        enPlataforma: false
    };

    obstaculos.forEach(elem => {

        const bLeft =
            parseInt(
                elem.style.left
            ) || elem.offsetLeft;

        const bBottom =
            parseInt(
                elem.style.bottom
            ) || 50;

        const bWidth =
            elem.offsetWidth;

        const bHeight =
            elem.offsetHeight;

        const solapeX =
            (
                resultado.x +
                marioWidth >
                bLeft
            ) &&
            (
                resultado.x <
                bLeft +
                bWidth
            );

        const solapeY =
            (
                resultado.y +
                marioHeight >
                bBottom
            ) &&
            (
                resultado.y <
                bBottom +
                bHeight
            );

        if (
            solapeX &&
            solapeY
        ) {

            const previoSolapeX =
                (
                    marioX +
                    marioWidth >
                    bLeft
                ) &&
                (
                    marioX <
                    bLeft +
                    bWidth
                );

            if (previoSolapeX) {

                if (
                    velocidadY <= 0 &&
                    marioY >=
                    bBottom +
                    bHeight -
                    20
                ) {

                    resultado.y =
                        bBottom +
                        bHeight;

                    velocidadY = 0;

                    resultado.enPlataforma =
                        true;

                } else if (
                    velocidadY > 0 &&
                    marioY +
                    marioHeight <=
                    bBottom +
                    20
                ) {

                    resultado.y =
                        bBottom -
                        marioHeight;

                    velocidadY = 0;

                    if (
                        elem.id ===
                        'bloque-mensaje-ml' &&
                        !elem.classList.contains(
                            'usado'
                        )
                    ) {

                        elem.classList.add(
                            'usado'
                        );

                        activarBloque1();
                    }

                    if (
                        elem.id ===
                        'bloque-mensaje-ml2' &&
                        !elem.classList.contains(
                            'usado'
                        )
                    ) {

                        elem.classList.add(
                            'usado'
                        );

                        activarBloque2();
                    }

                    if (
                        elem.id ===
                        'bloque-mensaje-ml3' &&
                        !elem.classList.contains(
                            'usado'
                        )
                    ) {

                        elem.classList.add(
                            'usado'
                        );

                        activarBloque3();
                    }

                    if (
                        elem.id ===
                        'bloque-mensaje-ml4' &&
                        !elem.classList.contains(
                            'usado'
                        )
                    ) {

                        elem.classList.add(
                            'usado'
                        );

                        activarBloque4();
                    }
                }

            } else {

                if (
                    marioX +
                    marioWidth <=
                    bLeft
                ) {

                    resultado.x =
                        bLeft -
                        marioWidth;

                } else if (
                    marioX >=
                    bLeft +
                    bWidth
                ) {

                    resultado.x =
                        bLeft +
                        bWidth;
                }
            }
        }
    });

    return resultado;
}

function comprobarEntradaTuberia() {

    if (entrandoTuberia) return;

    if (!teclas.arrowdown) return;

    if (!tuberia) return;

    const marioWidth = 48;

    const tuberiaX =
        parseInt(
            tuberia.style.left
        ) || tuberia.offsetLeft;

    const tuberiaWidth =
        tuberia.offsetWidth;

    const tuberiaTop =
        parseInt(
            tuberia.style.bottom
        ) || 50;

    const sobreTuberia =
        marioX + marioWidth >
        tuberiaX &&
        marioX <=
        tuberiaX +
        tuberiaWidth &&
        marioY >=
        tuberiaTop;

    if (sobreTuberia) {

        entrarPorTuberia(
            'nivel2.html',
            tuberiaX,
            tuberiaWidth
        );
    }
}

function entrarPorTuberia(
    pagina,
    tuberiaX,
    tuberiaWidth
) {

    if (entrandoTuberia) return;

    entrandoTuberia = true;

    marioX =
        tuberiaX +
        (tuberiaWidth / 2) -
        24;

    marioY = 160;

    mario.style.left =
        marioX + 'px';

    mario.style.bottom =
        marioY + 'px';

    teclas.arrowleft = false;
    teclas.arrowright = false;
    teclas.arrowup = false;
    teclas.arrowdown = false;

    mario.className = '';

    mario.classList.add(
        'mario-idle',
        'bajando-tubo'
    );

    setTimeout(() => {

        window.location.href =
            pagina;

    }, 800);
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

    if (cartel3) {
        cartel3.classList.add('oculto');
    }

    if (cartel4) {
        cartel4.classList.add('oculto');
    }

    if (cartel5) {
        cartel5.classList.add('oculto');
    }

    if (cartel6) {
        cartel6.classList.add('oculto');
    }

    if (cartel7) {
        cartel7.classList.add('oculto');
    }
}

function activarBloque1() {

    ocultarTodosLosCarteles();

    if (cartel1) {

        ocultarTituloInicial();

        cartel1.classList.remove(
            'oculto'
        );
    }
}

function activarBloque2() {

    ocultarTodosLosCarteles();

    if (cartel2) {

        cartel2.classList.remove(
            'oculto'
        );
    }
}

function activarBloque3() {

    ocultarTodosLosCarteles();

    if (cartel3) {

        cartel3.classList.remove(
            'oculto'
        );
    }
}

function activarBloque4() {

    ocultarTodosLosCarteles();

    if (cartel4) {

        cartel4.classList.remove(
            'oculto'
        );
    }
}

function actualizar() {

    if (entrandoTuberia) {

        mario.style.left =
            marioX + 'px';

        mario.style.bottom =
            marioY + 'px';

        requestAnimationFrame(
            actualizar
        );

        return;
    }

    let nuevoX =
        marioX;

    let moviendose =
        false;

    if (teclas.arrowleft) {

        nuevoX -=
            velocidadX;

        direccion = -1;

        moviendose = true;
    }

    if (teclas.arrowright) {

        nuevoX +=
            velocidadX;

        direccion = 1;

        moviendose = true;
    }

    if (nuevoX < 0) {

        nuevoX = 0;
    }

    const anchoMario = 48;

    if (
        nuevoX >
        ANCHO_MUNDO -
        anchoMario
    ) {

        nuevoX =
            ANCHO_MUNDO -
            anchoMario;
    }

    if (
        teclas.arrowup &&
        enElSuelo
    ) {

        velocidadY =
            fuerzaSalto;

        enElSuelo = false;
    }

    let nuevoY =
        marioY +
        velocidadY;

    velocidadY -=
        gravedad;

    const colision =
        resolverColisiones(
            nuevoX,
            nuevoY
        );

    marioX =
        colision.x;

    marioY =
        colision.y;

    if (
        colision.enPlataforma
    ) {

        enElSuelo = true;

        velocidadY = 0;

    } else if (
        marioY <=
        nivelSuelo
    ) {

        marioY =
            nivelSuelo;

        velocidadY = 0;

        enElSuelo = true;

    } else {

        enElSuelo = false;
    }

    mario.className = '';

    if (!enElSuelo) {

        mario.classList.add(
            'mario-saltando'
        );

    } else if (moviendose) {

        mario.classList.add(
            'mario-corriendo'
        );

    } else {

        mario.classList.add(
            'mario-idle'
        );
    }

    mario.style.transform =
        `scaleX(${direccion * 1.2}) scaleY(1.2)`;

    mario.style.left =
        marioX + 'px';

    mario.style.bottom =
        marioY + 'px';

    actualizarCamara();

    comprobarEntradaTuberia();

    requestAnimationFrame(
        actualizar
    );
}

mario.style.left =
    marioX + 'px';

mario.style.bottom =
    marioY + 'px';

mario.style.transform =
    'scaleX(1.2) scaleY(1.2)';

entrandoTuberia = false;

actualizar();
