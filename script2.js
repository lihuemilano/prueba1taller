const mario = document.getElementById('mario');
const escenario = document.getElementById('escenario');

const planta1 = document.getElementById('planta1');
const planta2 = document.getElementById('planta2');

const tuboSalida = document.getElementById('tubo-salida');
const hongo = document.getElementById('hongo');

const cartel1 = document.getElementById('cartel-ml');
const cartel2 = document.getElementById('cartel-ml2');
const cartel3 = document.getElementById('cartel-ml3');
const cartel4 = document.getElementById('cartel-ml4');
const cartel5 = document.getElementById('cartel-ml5');
const cartel6 = document.getElementById('cartel-ml6');

const ANCHO_MUNDO = 3000;

const monedaTuberia = document.getElementById('moneda-tuberia');

// ======================================================
// ESTADOS GENERALES
// ======================================================

let monedaDisponible = false;
const nivelSuelo = 50;

// ======================================================
// POSICIÓN DE MARIO Y FÍSICA
// ======================================================

let marioX = 171;
let marioY = 230;

let velocidadY = 0;
let enElSuelo = false;
let direccion = 1;

let camaraX = 0;

const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;

// ======================================================
// CONTROLES
// ======================================================

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

// ======================================================
// ESTADOS DE MARIO
// ======================================================

let marioMuerto = false;
let marioEsFantasma = false;
let controlesBloqueados = false;

// ======================================================
// HONGO
// ======================================================

let hongoActivo = false;
let hongoX = 0;
let hongoY = 0;

// ======================================================
// TUBERÍA
// ======================================================

let bajandoTubo = false;

// Esta variable se activa solamente después de que
// Mario muere por la planta y revive.
let tuboPlantaHabilitado = false;

// ======================================================
// PLANTA 1
// ======================================================

let planta1Arriba = false;

// ======================================================
// PLANTA 2
// ======================================================

// La planta 2 comienza escondida.
let planta2Arriba = false;

// false = todavía no apareció
// true = ya apareció una vez y no vuelve a aparecer.
let planta2Aparecida = false;

// ======================================================
// COORDENADAS DE LA TUBERÍA DE LA PLANTA 2
// ======================================================

const tuboPlantaX = 2650;
const tuboPlantaWidth = 80;
const tuboPlantaTopY = nivelSuelo + 110;

function actualizarCamara() {
    const anchoPantalla = window.innerWidth;

    camaraX = marioX - (anchoPantalla / 3);

    if (camaraX < 0) {
        camaraX = 0;
    }

    const maxCamaraX = ANCHO_MUNDO - anchoPantalla;

    if (camaraX > maxCamaraX) {
        camaraX = maxCamaraX;
    }

    escenario.style.transform = `translateX(${-camaraX}px)`;
}
// ======================================================
// PLANTA 1
// ======================================================

function cicloPlanta1() {

    if (!planta1) return;

    if (marioMuerto) {

        planta1Arriba = false;

        planta1.style.bottom =
            '30px';

        setTimeout(
            cicloPlanta1,
            300
        );

        return;
    }

    planta1Arriba = !planta1Arriba;

    planta1.style.bottom =
        planta1Arriba ?
        '160px' :
        '10px';

    setTimeout(
        cicloPlanta1,
        2000
    );
}

if (planta1) {

    planta1.style.bottom =
        '30px';

    setTimeout(
        cicloPlanta1,
        1200
    );
}

// ======================================================
// COLISIONES CON OBSTÁCULOS
// ======================================================

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
            parseInt(elem.style.left) ||
            elem.offsetLeft;

        const bBottom =
            parseInt(elem.style.bottom) ||
            50;

        const bWidth =
            elem.offsetWidth;

        const bHeight =
            elem.offsetHeight;

        const solapeX =
            (resultado.x + marioWidth > bLeft) &&
            (resultado.x < bLeft + bWidth);

        const solapeY =
            (resultado.y + marioHeight > bBottom) &&
            (resultado.y < bBottom + bHeight);

        if (
            solapeX &&
            solapeY
        ) {

            const previoSolapeX =
                (marioX + marioWidth > bLeft) &&
                (marioX < bLeft + bWidth);

            if (previoSolapeX) {

                // ==========================================
                // CAER SOBRE BLOQUE / TUBERÍA
                // ==========================================

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
                }

                // ==========================================
                // GOLPEAR BLOQUE DESDE ABAJO
                // ==========================================
                else if (
                    velocidadY > 0 &&
                    marioY +
                    marioHeight <=
                    bBottom + 20
                ) {

                    resultado.y =
                        bBottom -
                        marioHeight;

                    velocidadY = 0;

                    // ======================================
                    // BLOQUE 1
                    // ======================================

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

                    // ======================================
                    // BLOQUE 2
                    // ======================================

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

                    // ======================================
                    // BLOQUE 3
                    // ======================================

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

                    // ======================================
                    // BLOQUE 4
                    // ======================================

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

                // ==========================================
                // COLISIÓN LATERAL
                // ==========================================

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
                    bLeft + bWidth
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

// ======================================================
// CARTELES
// ======================================================

function ocultarTodosLosCarteles() {

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
}

// ======================================================
// ACTIVAR CARTEL 1
// ======================================================

function activarBloque1() {

    ocultarTodosLosCarteles();

    if (cartel1) {
        cartel1.classList.remove(
            'oculto'
        );
    }
}

// ======================================================
// ACTIVAR CARTEL 2
// ======================================================

function activarBloque2() {

    ocultarTodosLosCarteles();

    if (cartel2) {
        cartel2.classList.remove(
            'oculto'
        );
    }
}

// ======================================================
// ACTIVAR CARTEL 3
// ======================================================

function activarBloque3() {

    ocultarTodosLosCarteles();

    if (cartel3) {
        cartel3.classList.remove(
            'oculto'
        );
    }
}

// ======================================================
// ACTIVAR CARTEL 4
// ======================================================

function activarBloque4() {

    ocultarTodosLosCarteles();

    if (cartel4) {
        cartel4.classList.remove(
            'oculto'
        );
    }
}

// ======================================================
// PLANTA 2
// PRIMERA VEZ SOBRE LA TUBERÍA
// ======================================================

function comprobarPlanta2SobreTubo() {

    // Si ya apareció una vez, no vuelve a aparecer.
    if (
        planta2Aparecida ||
        marioMuerto
    ) {
        return;
    }

    const centroMarioX =
        marioX + 24;

    const sobreTuboX =
        centroMarioX >=
        tuboPlantaX &&
        centroMarioX <=
        tuboPlantaX +
        tuboPlantaWidth;

    const sobreTuboY =
        Math.abs(
            marioY -
            tuboPlantaTopY
        ) < 15;

    // Mario está encima de la tubería.
    if (
        sobreTuboX &&
        sobreTuboY
    ) {

        // IMPORTANTE:
        // Se marca ANTES de activar la planta.
        // Así nunca podrá volver a salir.
        planta2Aparecida = true;

        activarPlanta2();
    }
}

// ======================================================
// HACER APARECER PLANTA 2
// ======================================================

function activarPlanta2() {

    planta2Arriba = true;

    if (planta2) {

        planta2.style.display = 'block';

        planta2.style.transition =
            'bottom 0.3s ease-out';

        planta2.style.bottom = '160px';
    }

    // ==========================================
    // CARTEL 5
    // ==========================================

    ocultarTodosLosCarteles();

    if (cartel5) {
        cartel5.classList.remove('oculto');
    }

    // ==========================================
    // MUERTE INMEDIATA
    // ==========================================

    ejecutarMuerteFantasma();
}

// ======================================================
// ESCONDER PLANTA 2
// ======================================================

function esconderPlanta2() {

    planta2Arriba = false;

    if (!planta2) return;

    planta2.style.transition =
        'bottom 0.2s ease-in';

    planta2.style.bottom =
        '30px';

    setTimeout(() => {

        planta2.style.display =
            'none';

    }, 250);
}

function ejecutarMuerteFantasma() {

    if (marioMuerto) return;

    marioMuerto = true;
    marioEsFantasma = true;
    controlesBloqueados = true;

    mario.style.zIndex = '20';

    mario.className = '';
    mario.classList.add('mario-fantasma');

    // CARTEL 5
    ocultarTodosLosCarteles();

    if (cartel5) {
        cartel5.classList.remove('oculto');
    }

    // La planta desaparece
    esconderPlanta2();

    // Impulso inicial de muerte
    velocidadY = 12;

    // Después de 4 segundos aparece el hongo
    setTimeout(() => {

        velocidadY = 0;

        aparecerHongoEspecial();

    }, 4000);
}


// ======================================================
// APARECER HONGO
// ======================================================

function aparecerHongoEspecial() {

    // El hongo queda donde murió Mario
    hongoX = marioX;
    hongoY = marioY;

    if (hongo) {

        hongo.style.left =
            hongoX + 'px';

        hongo.style.bottom =
            hongoY + 'px';

        hongo.style.display =
            'block';
    }

    hongoActivo = true;

    // CARTEL 6
    ocultarTodosLosCarteles();

    if (cartel6) {
        cartel6.classList.remove('oculto');
    }
}


// ======================================================
// ACTUALIZAR HONGO
// ======================================================

function actualizarHongo() {

    if (!hongoActivo || !hongo) {
        return;
    }

    const anchoHongo =
        hongo.offsetWidth || 40;

    const altoHongo =
        hongo.offsetHeight || 40;

    const anchoMario = 48;
    const altoMario = 60;

    const solapeX =
        marioX + anchoMario > hongoX &&
        marioX < hongoX + anchoHongo;

    const solapeY =
        marioY + altoMario > hongoY &&
        marioY < hongoY + altoHongo;

    if (solapeX && solapeY) {

        // ------------------------------------------
        // HONGO DESAPARECE
        // ------------------------------------------

        hongoActivo = false;

        hongo.style.display =
            'none';


        // ------------------------------------------
        // MARIO REVIVE
        // ------------------------------------------

        marioMuerto = false;
        marioEsFantasma = false;
        controlesBloqueados = false;
        let marioTitilando = false;

        // 50 PX A LA IZQUIERDA DE LA CAÑERÍA
        marioX =
            tuboPlantaX - 200;

        marioY =
            nivelSuelo;

        velocidadY = 0;

        enElSuelo = true;


        // ------------------------------------------
        // ANIMACIÓN NORMAL
        // ------------------------------------------

        mario.className =
            'mario-idle';

        mario.style.zIndex =
            '20';

        mario.style.opacity = '1';

        // Mario titila al reaparecer
        hacerTitilarMario();

        // ------------------------------------------
        // AHORA PUEDE VOLVER A ENTRAR
        // A LA CAÑERÍA
        // ------------------------------------------

        tuboPlantaHabilitado =
            true;


        // ------------------------------------------
        // MONEDA
        // ------------------------------------------

        if (monedaTuberia) {

            monedaTuberia.classList.remove(
                'oculto'
            );

            monedaDisponible =
                true;
        }

        actualizarCamara();
    }
}

function comprobarContactoMoneda() {

    if (!monedaDisponible ||
        bajandoTubo
    ) {
        return;
    }

    const mLeft = 720;
    const mBottom = 170;

    const solapeX =
        marioX + 48 > mLeft &&
        marioX < mLeft + 40;

    const solapeY =
        marioY + 60 > mBottom &&
        marioY < mBottom + 40;

    if (
        solapeX &&
        solapeY
    ) {

        monedaDisponible = false;

        bajandoTubo = true;

        controlesBloqueados = true;


        mario.style.transition =
            'transform 0.6s ease, opacity 0.6s ease';

        mario.style.transform =
            'scale(0) rotate(360deg)';

        mario.style.opacity =
            '0';

        setTimeout(() => {

            window.location.href =
                "nivel3A.html";

        }, 700);
    }
}
// ======================================================
// SEGUNDA VEZ SOBRE LA TUBERÍA
// ======================================================

function hacerTitilarMario() {
    marioTitilando = true;

    let visible = true;
    let cantidad = 0;

    const intervalo = setInterval(() => {

        visible = !visible;
        mario.style.opacity = visible ? '1' : '0.2';

        cantidad++;

        if (cantidad >= 10) {
            clearInterval(intervalo);

            mario.style.opacity = '1';
            marioTitilando = false;
        }

    }, 120);
}

function comprobarEntradaTubo() {

    // Esta función solamente funciona después
    // de que Mario murió y revivió.
    if (!tuboPlantaHabilitado ||
        bajandoTubo ||
        marioMuerto
    ) {
        return;
    }

    const centroMarioX =
        marioX + 24;

    const sobreTuboX =
        centroMarioX >= tuboPlantaX &&
        centroMarioX <= tuboPlantaX + tuboPlantaWidth;

    const sobreTuboY =
        Math.abs(
            marioY -
            tuboPlantaTopY
        ) < 12;

    // ==========================================
    // MARIO ENTRA AUTOMÁTICAMENTE
    // ==========================================

    if (
        sobreTuboX &&
        sobreTuboY &&
        enElSuelo
    ) {

        bajandoTubo = true;

        controlesBloqueados = true;

        marioX =
            tuboPlantaX +
            (tuboPlantaWidth / 2) -
            24;

        mario.style.left =
            marioX + 'px';

        mario.className = '';

        mario.classList.add(
            'mario-agachado',
            'bajando-tubo'
        );

        // ==========================================
        // CARTEL 6
        // ==========================================

        ocultarTodosLosCarteles();

        if (cartel6) {
            cartel6.classList.remove(
                'oculto'
            );
        }

        // ==========================================
        // ABSORBER A MARIO
        // ==========================================

        mario.style.transition =
            'transform 0.7s ease, opacity 0.7s ease';

        mario.style.transform =
            'scale(0.2)';

        mario.style.opacity =
            '0';

        setTimeout(() => {

            window.location.href =
                "nivel3A.html";

        }, 800);
    }
}

function actualizar() {

    actualizarCamara();

    // ==========================================
    // HONGO
    // ==========================================

    if (hongoActivo) {
        actualizarHongo();
    }

    // ==========================================
    // MARIO ENTRANDO A TUBERÍA
    // ==========================================

    if (bajandoTubo) {

        mario.style.left =
            marioX + 'px';

        mario.style.bottom =
            marioY + 'px';

        requestAnimationFrame(
            actualizar
        );

        return;
    }

    // ==========================================
    // MARIO VIVO
    // ==========================================

    if (!marioMuerto) {

        let nuevoX =
            marioX;

        let moviendose =
            false;

        // ==========================================
        // MOVIMIENTO
        // ==========================================

        if (!controlesBloqueados) {

            if (teclas.a) {

                nuevoX -=
                    velocidadX;

                direccion = -1;

                moviendose = true;
            }

            if (teclas.d) {

                nuevoX +=
                    velocidadX;

                direccion = 1;

                moviendose = true;
            }
        }

        if (nuevoX < 0) {
            nuevoX = 0;
        }

        // Límite derecho del mundo
        const anchoMario = 48;

        if (nuevoX > ANCHO_MUNDO - anchoMario) {
            nuevoX = ANCHO_MUNDO - anchoMario;
        }
        // ==========================================
        // SALTO
        // ==========================================

        if (
            teclas.w &&
            enElSuelo &&
            !controlesBloqueados
        ) {

            velocidadY =
                fuerzaSalto;

            enElSuelo =
                false;
        }

        // ==========================================
        // FÍSICA
        // ==========================================

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

        // ==========================================
        // PLATAFORMAS / SUELO
        // ==========================================

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

        // ==========================================
        // DETECCIONES
        // ==========================================

        // PRIMERA VEZ:
        // hace aparecer la planta.
        comprobarPlanta2SobreTubo();

        // Moneda.
        comprobarContactoMoneda();

        // SEGUNDA VEZ:
        // permite entrar a la tubería.
        comprobarEntradaTubo();

        // ==========================================
        // ANIMACIÓN DE MARIO
        // ==========================================

        mario.className = '';

        if (marioEsFantasma) {

            mario.classList.add(
                'mario-fantasma'
            );

        } else if (!enElSuelo) {

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
    }

    // ==========================================
    // MARIO MUERTO / FANTASMA
    // ==========================================
    else if (
        marioMuerto &&
        marioEsFantasma
    ) {

        marioY +=
            velocidadY;

        velocidadY -=
            gravedad;

        if (
            marioY <
            nivelSuelo
        ) {

            marioY =
                nivelSuelo;

            velocidadY = 0;
        }
    }

    // ==========================================
    // POSICIÓN VISUAL
    // ==========================================

    mario.style.transform =
        `scaleX(${direccion * 1.2}) scaleY(1.2)`;

    mario.style.left =
        marioX + 'px';

    mario.style.bottom =
        marioY + 'px';

    requestAnimationFrame(
        actualizar
    );
}

// ======================================================
// INICIALIZACIÓN
// ======================================================

// Planta 2 empieza completamente escondida.
if (planta2) {

    planta2Arriba = false;

    planta2Aparecida = false;

    planta2.style.bottom =
        '30px';

    planta2.style.display =
        'none';
}

// Iniciar juego.
actualizar();
