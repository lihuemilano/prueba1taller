const RUTA_CAYENDO = './img/mariocayendo.png';
const RUTA_CAIDO = './img/mariosaluda.png';

function simularCaida() {
    const contenedor = document.getElementById('mario-caida');
    const imagen = document.getElementById('img-objeto');

    if (!contenedor || !imagen) return;

    imagen.src = RUTA_CAYENDO;

    contenedor.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'top') {
            imagen.src = RUTA_CAIDO;
        }
    });

    setTimeout(() => {
        // Usamos 'cayo' sin tilde
        contenedor.classList.add('cayo');
    }, 50);
}

window.addEventListener('DOMContentLoaded', simularCaida);

document.addEventListener("keydown", function(event) {
    if (event.key === 'Enter') {
        window.location.href = "inicio3.html";
    }
});