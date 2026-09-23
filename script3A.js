<!DOCTYPE html>

<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Mario ML - Nivel 2</title>
    <link rel="stylesheet" href="style3A.css">
</head>

<body id="juego-nivel2">

    <div id="juego">
        <div id="escenario">
            <div id="mundo">

                <div id="titulo-inicial">
                    <h2>¿Cómo aprende una <span style="color: gold;">computadora?</span>
                    </h2>
                </div>


                <!-- Bloque amarillo interactivo -->
                <div class="bloque obstaculo" style="left: 600px; bottom: 190px; width: 50px; height: 50px;"></div>

                <div class="bloque-amarillo obstaculo" style="left: 650px; bottom: 190px; width: 50px; height: 50px;" id="bloque-mensaje-ml"></div>
                <div class="bloque obstaculo" style="left: 700px; bottom: 190px; width: 50px; height: 50px;"></div>


                <div id="cartel-ml" class="oculto">

                    <div class="texto-ml">
                        <h2>
                            permite que las maquinas aprendan de datos y reconozcan patrones sin recibir instrucciones para cada situación.
                        </h2>
                    </div>

                    <div class="proceso-ml">

                        <div class="etapa-ml">
                            <div class="icono-ml">📚</div>
                            <span>Datos</span>
                        </div>

                        <div class="flecha-ml">→</div>

                        <div class="etapa-ml">
                            <div class="icono-ml entrenamiento">🏋️‍♂️</div>
                            <span>Entrenamiento</span>
                        </div>

                        <div class="flecha-ml">→</div>

                        <div class="etapa-ml">
                            <div class="icono-ml">👥</div>
                            <span>Modelo</span>
                        </div>

                        <div class="flecha-ml">→</div>

                        <div class="etapa-ml">
                            <div class="icono-ml">💡</div>
                            <span>Proyección</span>
                        </div>

                    </div>

                </div>

                <div class="tuberia obstaculo" style="left: 950px; bottom: 50px; width: 80px; height: 110px;"></div>


                <!-- Tubería 1 + Planta 1 -->
                <div class="tuberia obstaculo" style="left: 150px; bottom: 50px; width: 90px; height: 180px;"></div>

                <div class="bloque obstaculo" style="left: 1400px; bottom: 190px; width: 50px; height: 50px;"></div>

                <div class="bloque-amarillo obstaculo" style="left: 1450px; bottom: 190px; width: 50px; height: 50px;" id="bloque-mensaje-ml2"></div>
                <div class="bloque obstaculo" style="left: 1500px; bottom: 190px; width: 50px; height: 50px;"></div>
                <div class="bloque obstaculo" style="left: 1550px; bottom: 190px; width: 50px; height: 50px;"></div>


                <div id="cartel-ml2" class="oculto">
                    <h2>lo hace a traves del analisis <br>de ejemplos y patrones</h2>
                    <img src="https://cdn-icons-png.flaticon.com/512/1006/1006638.png" alt="">

                </div>

                <div class="bloque-amarillo obstaculo" style="left: 1600px; bottom: 190px; width: 50px; height: 50px;" id="bloque-mensaje-ml3"></div>
                <div id="cartel-ml3" class="oculto">
                    <h2>utiliza lo aprendido para realizar<br> predicciones o tomar decisiones</h2>
                    <img src="https://cdn-icons-png.flaticon.com/512/910/910373.png" alt="">
                </div>


                <div id="tuberia" class="tuberia obstaculo" style="left: 1900px; bottom: 50px; width: 90px; height: 110px;">
                </div>


                <!-- Mario -->
                <div id="mario" class="mario-idle" style="left: 171px; bottom: 230px;"></div>
            </div>

            <!-- Piso -->
            <div id="piso"></div>
        </div>
    </div>

    <script src="script3A.js"></script>
</body>

</html>
