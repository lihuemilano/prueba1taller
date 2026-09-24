const mario = document.getElementById('mario');
const imgMario = document.getElementById('img-mario');
const marioExe = document.getElementById('mario-exe');
const imgMarioExe = document.getElementById('img-mario-exe');
const mundoDOM = document.getElementById('mundo');
const capaProyectiles = document.getElementById('capa-proyectiles');
const modalResultado = document.getElementById('modal-resultado');

let juegoIniciado = false;

function iniciarCombate() {
    const overlay = document.getElementById('intro-overlay');
    if (overlay) overlay.style.display = 'none';
    juegoIniciado = true;
    requestAnimationFrame(actualizar);
}

// Crear piso con bloques
const contenedorPiso = document.getElementById('piso-bloques');
for (let x = 0; x < 3200; x += 50) {
    const bloquePiso = document.createElement('div');
    bloquePiso.className = 'bloque-piso';
    bloquePiso.style.left = x + 'px';

    const img = document.createElement('img');
    img.src = 'img/bloque.jpg';
    img.style.width = '100%';
    img.style.height = '100%';

    bloquePiso.appendChild(img);
    contenedorPiso.appendChild(bloquePiso);
}

const nivelSueloBase = 50;
let marioX = 171;
let marioY = 50;
let velocidadY = 0;
let enElSuelo = true;
let direccion = 1;

let vidasMario = 3;
let poderMario = 'normal';
let invulnerableTimer = 0;
let juegoTerminado = false;

const velocidadX = 6.5;
const gravedad = 0.75;
const fuerzaSalto = 18; // Incrementado para alcanzar los bloques superiores fácilmente

const teclas = {
    a: false,
    d: false,
    w: false,
    s: false,
    x: false,
    arrowleft: false,
    arrowright: false,
    arrowup: false,
    arrowdown: false,
    ' ': false
};

let exeX = 800;
let exeY = 50;
let exeHPEmax = 300;
let exeHP = 300;
let exeVelocidadY = 0;
let exeEnElSuelo = true;
let exeDireccion = -1;
let exeCooldownAtaque = 0;

let exeAprendioDisparo = false;

let proyectiles = [];
let powerups = [];

window.addEventListener('keydown', (e) => {
    const tecla = e.key.toLowerCase();
    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = true;
        if (tecla === ' ' || tecla === 'arrowup' || tecla === 'arrowdown') {
            e.preventDefault();
        }
    }
    if (e.key === 'Enter') {
        salirAlMenu();
    }
});

window.addEventListener('keyup', (e) => {
    const tecla = e.key.toLowerCase();
    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = false;
    }
});

function obtenerDimensionesMario() {
    return {
        ancho: mario ? (mario.offsetWidth || 150) : 150,
        alto: mario ? (mario.offsetHeight || 60) : 60
    };
}

function obtenerDimensionesExe() {
    return {
        ancho: marioExe ? (marioExe.offsetWidth || 180) : 180,
        alto: marioExe ? (marioExe.offsetHeight || 90) : 90
    };
}

function obtenerPlataformas() {
    const elementos = document.querySelectorAll('.tuberia, .cañeria-entrada, .bloque, .bloque-amarillo');
    const plataformas = [];

    elementos.forEach(el => {
        const left = parseFloat(el.style.left) || 0;
        const bottom = parseFloat(el.style.bottom) || 0;
        const width = parseFloat(el.style.width) || el.offsetWidth || 50;
        const height = parseFloat(el.style.height) || el.offsetHeight || 50;

        plataformas.push({
            dom: el,
            left: left,
            right: left + width,
            bottom: bottom,
            top: bottom + height,
            width: width,
            height: height,
            esBloqueAmarillo: el.classList.contains('bloque-amarillo'),
            usado: el.classList.contains('bloque-usado')
        });
    });

    return plataformas;
}

// FÍSICAS REVISADAS: SALTO Y GOLPE A BLOQUES DE SIGNO AJUSTADOS
function moverConColisiones(posX, posY, ancho, alto, velY, esJugador, movX) {
    let nX = posX + movX;
    let nY = posY + velY;
    let nVelY = velY;
    let sobreSuelo = false;
    let sueloMaximo = nivelSueloBase;

    const margenLateral = esJugador ? 45 : 55;
    const hitboxLeft = nX + margenLateral;
    const hitboxRight = nX + ancho - margenLateral;

    const plataformas = obtenerPlataformas();

    // 1. COLISIÓN HORIZONTAL
    plataformas.forEach(plat => {
        const solapaY = (posY < plat.top - 2) && (posY + alto > plat.bottom + 2);

        if (solapaY) {
            if (posX + ancho - margenLateral <= plat.left && hitboxRight > plat.left) {
                nX = plat.left - (ancho - margenLateral);
            } else if (posX + margenLateral >= plat.right && hitboxLeft < plat.right) {
                nX = plat.right - margenLateral;
            }
        }
    });

    const hitboxLeftFinal = nX + margenLateral;
    const hitboxRightFinal = nX + ancho - margenLateral;

    // 2. COLISIÓN VERTICAL (ATERRIZAJE Y DETECCIÓN AL CABECEAR BLOQUES)
    plataformas.forEach(plat => {
        // Tolerancia horizontal ampliada para golpear bloques sin requerir un centrado milimétrico
        const solapaX = (hitboxRightFinal + 10 > plat.left) && (hitboxLeftFinal - 10 < plat.right);

        if (solapaX) {
            // Aterrizar encima de la tubería o bloque
            if (posY >= plat.top - 15 && nY <= plat.top && velY <= 0) {
                if (plat.top > sueloMaximo) {
                    sueloMaximo = plat.top;
                }
            }
            // Cabecear bloque desde abajo (Tolerancia ampliada a 20px)
            else if (posY + alto <= plat.bottom + 20 && nY + alto >= plat.bottom && velY > 0) {
                nY = plat.bottom - alto;
                nVelY = 0;

                if (esJugador && plat.esBloqueAmarillo && !plat.usado) {
                    plat.dom.classList.add('bloque-usado');

                    const tipoPowerup = Math.random() < 0.4 ? 'life' : 'flower';
                    generarPowerUp(plat.left + 8, plat.top + 5, tipoPowerup);

                    setTimeout(() => {
                        plat.dom.classList.remove('bloque-usado');
                    }, 5000);
                }
            }
        }
    });

    if (nY <= sueloMaximo) {
        nY = sueloMaximo;
        nVelY = 0;
        sobreSuelo = true;
    }

    return { x: nX, y: nY, velY: nVelY, enSuelo: sobreSuelo };
}

function generarPowerUp(x, y, tipo) {
    const el = document.createElement('div');
    el.className = 'powerup powerup-item';
    if (tipo === 'life') {
        el.classList.add('powerup-life');
    }
    el.style.left = x + 'px';
    el.style.bottom = y + 'px';

    const img = document.createElement('img');
    img.src = 'img/flor.png';
    img.style.width = '100%';
    img.style.height = '100%';
    el.appendChild(img);

    capaProyectiles.appendChild(el);
    powerups.push({ x: x, y: y, ancho: 35, alto: 35, dom: el, tipo: tipo });
}

function actualizar() {
    if (!juegoIniciado || juegoTerminado) return;

    const dimMario = obtenerDimensionesMario();

    if (invulnerableTimer > 0) invulnerableTimer--;

    let movimientoHorizontal = 0;
    if (teclas.a || teclas.arrowleft) {
        movimientoHorizontal -= velocidadX;
        direccion = -1;
    }
    if (teclas.d || teclas.arrowright) {
        movimientoHorizontal += velocidadX;
        direccion = 1;
    }

    if ((teclas.w || teclas.arrowup) && enElSuelo) {
        velocidadY = fuerzaSalto;
        enElSuelo = false;
    }

    if ((teclas.x || teclas[' ']) && poderMario === 'fire' && !mario.cooldownDisparo) {
        mario.cooldownDisparo = 18;
        lanzarFuegoMario();
        exeAprendioDisparo = true;
    }
    if (mario.cooldownDisparo > 0) mario.cooldownDisparo--;

    velocidadY -= gravedad;

    const resMario = moverConColisiones(marioX, marioY, dimMario.ancho, dimMario.alto, velocidadY, true, movimientoHorizontal);
    marioX = Math.max(0, Math.min(3050, resMario.x));
    marioY = resMario.y;
    velocidadY = resMario.velY;
    enElSuelo = resMario.enSuelo;

    if (mario) {
        mario.className = '';
        if (invulnerableTimer > 0) mario.classList.add('invulnerable');

        if (!enElSuelo) {
            imgMario.src = 'img/mariocaminando2.png';
        } else {
            imgMario.src = 'img/marionormal.png';
        }

        if (poderMario === 'fire') {
            imgMario.classList.add('mario-fuego-colores');
        } else {
            imgMario.classList.remove('mario-fuego-colores');
        }

        mario.style.transform = `scaleX(${direccion})`;
        mario.style.left = marioX + 'px';
        mario.style.bottom = marioY + 'px';
    }

    if (mundoDOM && marioX > 300 && marioX < 2400) {
        mundoDOM.style.transform = `translateX(-${marioX - 300}px)`;
    }

    actualizarMarioExe();
    actualizarProyectilesYPowerups();

    requestAnimationFrame(actualizar);
}

function lanzarFuegoMario() {
    const dimMario = obtenerDimensionesMario();
    const p = document.createElement('div');
    p.className = 'proyectil proyectil-mario';
    const px = direccion === 1 ? marioX + dimMario.ancho - 30 : marioX + 10;
    p.style.left = px + 'px';
    p.style.bottom = (marioY + 20) + 'px';

    const img = document.createElement('img');
    img.src = 'img/boladefuego.png';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.transform = `scaleX(${direccion})`;
    p.appendChild(img);

    capaProyectiles.appendChild(p);
    proyectiles.push({ x: px, y: marioY + 20, vx: direccion * 9, dom: p, esDeMario: true });
}

function actualizarMarioExe() {
    if (!marioExe) return;

    const dimMario = obtenerDimensionesMario();
    const dimExe = obtenerDimensionesExe();

    exeCooldownAtaque++;

    let exeMovX = 0;
    if (marioX < exeX) {
        exeMovX = -2.5;
        exeDireccion = -1;
    } else {
        exeMovX = 2.5;
        exeDireccion = 1;
    }

    if (Math.random() < 0.012 && exeEnElSuelo) {
        exeVelocidadY = fuerzaSalto * 0.85;
        exeEnElSuelo = false;
    }

    if (exeAprendioDisparo && exeCooldownAtaque > 110) {
        exeCooldownAtaque = 0;
        lanzarAtaqueExe();
    }

    exeVelocidadY -= gravedad;

    const resExe = moverConColisiones(exeX, exeY, dimExe.ancho, dimExe.alto, exeVelocidadY, false, exeMovX);
    exeX = resExe.x;
    exeY = resExe.y;
    exeVelocidadY = resExe.velY;
    exeEnElSuelo = resExe.enSuelo;

    const marioLeft = marioX + 45;
    const marioRight = marioX + dimMario.ancho - 45;
    const exeLeft = exeX + 55;
    const exeRight = exeX + dimExe.ancho - 55;

    const colisionX = (marioRight > exeLeft) && (marioLeft < exeRight);
    const colisionY = (marioY + dimMario.alto > exeY) && (marioY < exeY + dimExe.alto);

    if (colisionX && colisionY) {
        if (velocidadY < 0 && marioY + 15 >= exeY + dimExe.alto - 20) {
            exeHP -= 10;
            velocidadY = 13;
            actualizarHUD();
        } else if (invulnerableTimer === 0) {
            dañarMario();
        }
    }

    marioExe.style.transform = `scaleX(${exeDireccion})`;
    marioExe.style.left = exeX + 'px';
    marioExe.style.bottom = exeY + 'px';
}

function lanzarAtaqueExe() {
    const dimExe = obtenerDimensionesExe();
    const p = document.createElement('div');
    p.className = 'proyectil proyectil-exe';
    const dir = exeX < marioX ? 1 : -1;
    const px = dir === 1 ? exeX + dimExe.ancho - 40 : exeX + 10;
    p.style.left = px + 'px';
    p.style.bottom = (exeY + 20) + 'px';

    const img = document.createElement('img');
    img.src = 'img/boladefuego.png';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.transform = `scaleX(${dir})`;
    p.appendChild(img);

    capaProyectiles.appendChild(p);
    proyectiles.push({ x: px, y: exeY + 20, vx: dir * 6.5, dom: p, esDeMario: false });
}

function actualizarProyectilesYPowerups() {
    const dimMario = obtenerDimensionesMario();
    const dimExe = obtenerDimensionesExe();

    for (let i = proyectiles.length - 1; i >= 0; i--) {
        let p = proyectiles[i];
        p.x += p.vx;
        p.dom.style.left = p.x + 'px';

        const marioLeft = marioX + 45;
        const marioRight = marioX + dimMario.ancho - 45;
        const exeLeft = exeX + 55;
        const exeRight = exeX + dimExe.ancho - 55;

        if (!p.esDeMario && invulnerableTimer === 0 && p.x < marioRight && p.x + 32 > marioLeft && p.y < marioY + dimMario.alto && p.y + 32 > marioY) {
            dañarMario();
            p.dom.remove();
            proyectiles.splice(i, 1);
            continue;
        }

        if (p.esDeMario && p.x < exeRight && p.x + 28 > exeLeft && p.y < exeY + dimExe.alto && p.y + 28 > exeY) {
            exeHP -= 5;
            actualizarHUD();
            p.dom.remove();
            proyectiles.splice(i, 1);
            continue;
        }

        if (p.x < 0 || p.x > 3200) {
            p.dom.remove();
            proyectiles.splice(i, 1);
        }
    }

    for (let i = powerups.length - 1; i >= 0; i--) {
        let pw = powerups[i];
        const marioLeft = marioX + 45;
        const marioRight = marioX + dimMario.ancho - 45;

        if (marioLeft < pw.x + pw.ancho && marioRight > pw.x && marioY < pw.y + pw.alto && marioY + dimMario.alto > pw.y) {
            if (pw.tipo === 'life') {
                if (vidasMario < 5) {
                    vidasMario++;
                }
            } else {
                poderMario = 'fire';
            }
            actualizarHUD();
            pw.dom.remove();
            powerups.splice(i, 1);
        }
    }
}

function dañarMario() {
    if (poderMario === 'fire') {
        poderMario = 'normal';
    } else {
        vidasMario--;
    }

    invulnerableTimer = 60;
    actualizarHUD();

    if (vidasMario <= 0) {
        mostrarModal(false);
    }
}

function actualizarHUD() {
    document.getElementById('vidas-mario').innerText = 'VIDAS: ' + '❤️'.repeat(Math.max(0, vidasMario));
    document.getElementById('poder-mario').innerText = 'PODER: ' + (poderMario === 'fire' ? 'FUEGO' : 'NORMAL');
    document.getElementById('barra-hp-exe').style.width = Math.max(0, (exeHP / exeHPEmax) * 100) + '%';

    if (exeHP <= 0 && !juegoTerminado) {
        mostrarModal(true);
    }
}

function mostrarModal(victoria) {
    juegoTerminado = true;

    mario.className = '';
    if (victoria) {
        imgMario.src = 'img/mariosaluda.png';
    } else {
        imgMario.src = 'img/mariocayendo.png';
    }

    setTimeout(() => {
        modalResultado.classList.remove('modal-oculto');
        const titulo = document.getElementById('titulo-modal');
        const mensaje = document.getElementById('mensaje-modal');

        if (victoria) {
            titulo.innerText = "¡GANASTE!";
            titulo.style.color = "#28a745";
            mensaje.innerText = "¡Has derrotado a Mario.EXE!";
        } else {
            titulo.innerText = "PERDISTE";
            titulo.style.color = "#dc3545";
            mensaje.innerText = "Mario.EXE te ha vencido...";
        }
    }, 1000);
}

function reiniciarNivel() {
    window.location.reload();
}

function salirAlMenu() {
    window.location.href = "index1.html";
}