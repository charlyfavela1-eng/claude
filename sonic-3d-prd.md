# PRD — Sonic 3D: Open World Pursuit
**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Motor:** Three.js (Web) → Three.js + WebGPU (producción)  
**Plataforma objetivo:** Navegador moderno (Chrome/Firefox/Edge), Desktop-first

---

## 1. Visión del producto

Un juego de plataformas 3D de mundo abierto protagonizado por Sonic the Hedgehog, donde el Dr. Eggman persigue activamente al jugador a través de un mundo interconectado de zonas temáticas. El jugador explora libremente, colecta anillos, desbloquea nuevas áreas y lanza **Warp Rings** para teletransportarse. Eggman aparece en su nave Egg Mobile y adapta sus tácticas según la zona donde se encuentre Sonic.

**Frase clave del producto:**  
*"La velocidad es tu única defensa. Corre, lanza, desaparece."*

---

## 2. Objetivos de negocio / métricas de éxito

| Métrica | Meta (30 días de lanzamiento) |
|---|---|
| Sesiones promedio por usuario | > 4 por semana |
| Duración media de sesión | > 18 minutos |
| Porcentaje de usuarios que desbloquean zona 3+ | > 40 % |
| Tasa de retención D7 | > 35 % |
| FPS promedio en Chrome desktop | ≥ 60 fps |

---

## 3. Personas de usuario

### 3.1 El Speedrunner Casual
- 18–28 años, juega en pausas de trabajo o estudio  
- Quiere partidas cortas pero satisfactorias  
- Valora el feedback inmediato (puntaje, combos, velocidad)

### 3.2 El Explorador
- 16–35 años, disfruta descubrir secretos  
- Quiere un mundo con zonas ocultas, coleccionables y lore  
- Se frustra con muros invisibles o caminos lineales

### 3.3 El Nostálgico de Sonic
- 25–40 años, fan de Sonic Adventure / Heroes / Generations  
- Quiere ver personajes canónicos bien representados  
- Exige que el movimiento de Sonic se *sienta* correcto

---

## 4. Diseño de personajes

### 4.1 Sonic the Hedgehog — Diseño definitivo

#### Proporciones
| Parte | Descripción |
|---|---|
| Cabeza | Grande (40 % del torso), forma de cacahuate ensanchado hacia arriba |
| Ojos | Enormes, verdes, con pupila negra pequeña; unidos en el centro (diseño moderno) |
| Nariz | Pequeña, ovalada, marrón claro |
| Hocico | Crema/melocotón, abarca mejillas y frente inferior |
| Torso | Azul cobalto (`#1E90FF`), ligeramente comprimido lateralmente |
| Barriga | Parche crema oval en el pecho |
| Brazos | Cortos, con guantes blancos grandes (4 dedos) |
| Piernas | Largas y delgadas; propulsión visual exagerada al correr |
| Zapatos | Rojo (`#DD2222`) con hebilla dorada, suela blanca y línea plateada |
| Spikes | 6 spikes traseros: 3 en la cabeza (larga, media, corta), 3 en la espalda escalonados |

#### Materiales 3D
- **Cuerpo**: `MeshToonMaterial` azul cobalto con borde negro (cel-shading)
- **Piel**: `MeshToonMaterial` crema cálido
- **Ojos**: `MeshStandardMaterial` verde esmeralda con `emissive` sutil
- **Guantes**: `MeshToonMaterial` blanco con sombra gris
- **Zapatos**: `MeshStandardMaterial` rojo, metalness 0.2

#### Animaciones requeridas
| Animación | Trigger | Descripción |
|---|---|---|
| `idle` | Quieto >2s | Balanceo suave, parpadeo |
| `run` | Velocidad 0.1–0.3 | Piernas en ciclo, brazos atrás |
| `sprint` | Velocidad >0.3 | Blur de piernas, inclinación frontal |
| `jump` | Saltar | Cuerpo compacto, spin |
| `spindash_charge` | Shift held | Giro en espiral creciente |
| `spindash_release` | Shift up | Explosión de velocidad + polvo |
| `land` | Aterrizaje | Squash en Y, partículas de polvo |
| `hurt` | Daño | Flash blanco, anillos salen despedidos |
| `warp_throw` | Clic | Brazo extendido, giro del anillo |
| `victory` | Meta / boss derrotado | Pulgar arriba, animación de salto |

#### Efectos de velocidad
- **Blur de movimiento**: Sombras de Sonic (ghosts) a 0.3+ velocidad
- **Speed lines**: Líneas blancas desde la cámara
- **Afterimage**: Copias fantasma azules semitransparentes al spindash
- **Sonic Boom**: Onda circular al superar velocidad máxima

---

### 4.2 Dr. Eggman / Robotnik — IA Perseguidora

#### Diseño visual
| Parte | Descripción |
|---|---|
| Cuerpo | Forma de huevo gigante, rojo y negro |
| Bigote | Marrón, enorme, dos puntas curvadas hacia arriba |
| Gafas | Circulares, lentes naranja con brillo |
| Brazos | Cortos, guantes amarillos |
| Nave | **Egg Mobile**: cápsula roja con cubierta de vidrio, propulsor inferior |

#### Sistema de IA — Eggman Pursuit Engine (EPE)

Eggman no persigue linealmente; usa un sistema de fases:

```
Estado 1: PATRULLA
  → Eggman sobrevuela la zona en su ruta fija
  → Aparece en el horizonte, visible pero no amenazante
  → Duración: primeros 90 segundos en zona

Estado 2: ALERTA
  → Trigger: Sonic entra en radio de 40 unidades
  → Eggman gira hacia Sonic, acelera hacia él
  → Lanza Badniks al suelo cada 8 segundos

Estado 3: PERSECUCIÓN ACTIVA
  → Trigger: Sonic en radio de 20 unidades
  → Velocidad de Eggman = 80% de la velocidad de Sonic
  → Lanza misiles teledirigidos (evasión requerida)
  → Usa obstáculos del entorno para bloquear caminos

Estado 4: TRAMPA
  → Trigger: Sonic lleva >30s en el mismo área
  → Eggman coloca bloqueos para acorralar
  → Invoca Egg Robo de élite

Estado 5: RETIRADA
  → Trigger: Sonic lanza Warp Ring y se teletransporta
  → Eggman tarda 20s en localizar la nueva zona
  → Al llegar, aparece desde el fondo con sirena
```

#### Ataques de Eggman por zona
| Zona | Ataque especial |
|---|---|
| Green Hill | Cortacéspedes giratorio lanzado desde el aire |
| Casino Night | Bolas de pinball teledirigidas |
| Chemical Plant | Chorros de líquido que ralentizan |
| Ice Cap | Rayo congelador (Sonic queda inmóvil 2s) |
| Lava Reef | Bombas de lava con área de efecto |
| Final (Egg Fortress) | Combinación de todos los anteriores |

#### Diálogos de Eggman (voz/subtítulos)
- *"¡Aquí no hay portal que te salve, maldito erizo!"*
- *"¡Mis Badniks te atraparán antes de que termines de correr!"*
- *"¡Calculé TODAS tus rutas de escape!"*
- *"¡Esto no ha terminado, Sonic!"* (al perder de vista)

---

## 5. Mundo abierto — Estructura

### 5.1 Mapa general: Planet Freedom

```
                    [Egg Fortress] ← zona final desbloqueada
                          │
            ┌─────────────┼─────────────┐
            │             │             │
      [Ice Cap]    [Chemical Plant]  [Lava Reef]
            │             │             │
            └──────[Green Hill]─────────┘
                          │
                    [Casino Night]
                    (hub central)
```

**Casino Night** actúa como hub central: Sonic comienza aquí. Desde el hub se accede a todas las zonas mediante portales físicos (arcos con marca temática) O mediante Warp Rings lanzados en la dirección correcta.

### 5.2 Propiedades de cada zona

| Zona | Área (unidades) | Bioma | Mecánica especial | Coleccionables |
|---|---|---|---|---|
| Green Hill | 200×150 | Pradera tropical | Loops automáticos | Esmeraldas del Caos (3) |
| Casino Night | 120×120 | Ciudad noche / casino | Bumpers, flippers | Monedas especiales |
| Chemical Plant | 180×100 | Fábrica industrial | Tubos de transporte | Planos de Eggman |
| Ice Cap | 200×160 | Montaña nevada | Física de hielo, snowboard | Cristales de hielo |
| Lava Reef | 160×120 | Volcán submarino | Plataformas móviles | Rubíes de lava |
| Egg Fortress | 100×80 | Fortaleza espacial | Boss multi-fase | Chaos Emerald final |

### 5.3 Transición entre zonas

- **Portales físicos**: Arcos visibles en el borde de cada zona; requieren N anillos para activar
- **Warp Ring**: El jugador lanza el anillo; si apunta en dirección de otra zona, el portal conecta con ella
- **Fast Travel**: Tras visitar una zona por primera vez, aparece en el mapa de pausa
- **Zona oculta**: Si se recolectan las 7 Chaos Emeralds → acceso a **Hyper Sonic Mode** y zona secreta

---

## 6. Sistemas de juego

### 6.1 Física de Sonic

```
Velocidad base:        0.18 unidades/frame
Aceleración:          0.025 u/f²
Velocidad máxima:     0.55 u/f
Velocidad spindash:   1.4  u/f (decae con fricción)
Gravedad normal:      0.032 u/f²
Gravedad en aire:     0.028 u/f²
Salto:                0.70 u/f inicial
Doble salto:          0.55 u/f (desbloqueable)
Fricción normal:      0.84
Fricción hielo:       0.97 (Ice Cap)
Pendientes:           +/- 30% velocidad según ángulo
```

### 6.2 Sistema de Warp Ring

| Propiedad | Valor |
|---|---|
| Cooldown entre lanzamientos | 3 segundos |
| Velocidad del anillo | 0.42 u/f + arco parabólico |
| Distancia máxima de vuelo | 80 unidades |
| Radio del portal creado | 2.5 unidades |
| Tiempo de vida del portal | 25 segundos |
| Máximo portales activos | 1 (el nuevo reemplaza al anterior) |
| Anillos necesarios para usarlo | 0 (sin costo, es mecánica central) |

**Mecánica avanzada — Portal Cadena:**  
Si Sonic lanza un Warp Ring mientras está atravesando otro portal, se crea un enlace entre zonas que dura 8 segundos (ambos portales activos simultáneamente). Permite estrategia de evasión avanzada contra Eggman.

### 6.3 Sistema de anillos

- Recoger 100 anillos → vida extra
- Al recibir daño: se sueltan todos los anillos (5 segundos para recogerlos)
- Con 0 anillos al recibir daño → muerte / checkpoint
- Anillos de colores especiales:
  - 🟡 **Dorado**: 1 punto
  - 🔵 **Azul**: 5 puntos + velocidad temporal
  - 🔴 **Rojo**: 10 puntos + invencibilidad 3s
  - ⚪ **Blanco**: Revela mapa de zona actual

### 6.4 Sistema de puntuación y combos

```
Anillo recogido:          +10 pts
Badnik destruido:        +100 pts × combo
Combo (sin tocar suelo): multiplicador x1 → x2 → x4 → x8
Eggman esquivado:        +500 pts
Portal abierto:          +200 pts
Chaos Emerald obtenida:  +5000 pts
Tiempo bonificación:     -1 pt/segundo transcurrido
```

### 6.5 Progresión y desbloqueos

| Requisito | Desbloqueo |
|---|---|
| 50 anillos recogidos | Doble salto |
| Destruir 10 Badniks | Homming Attack |
| Abrir 5 portales | Light Speed Dash (rayo de anillos) |
| Visitar las 5 zonas | Acceso a Egg Fortress |
| Recolectar 7 Chaos Emeralds | **Super Sonic** (invencible, velocidad x2) |
| Derrotar a Eggman | Créditos + modo contrarreloj |

---

## 7. Eggman — Boss Fights

### 7.1 Eggman en campo abierto (cada zona)
- Aparece tras 2–3 minutos en la zona
- 3 puntos de vida (cada impacto = saltar sobre él en nave)
- Al perder vida, velocidad y agresividad aumentan
- Huye si pierde las 3 vidas → no muere, vuelve en siguiente zona

### 7.2 Boss Final — Egg Fortress
**Fase 1**: Eggman en Egg Mobile clásico (mecánica de esquivar y contraatacar)  
**Fase 2**: Transforma en Egg Dragón (nave gigante que bloquea toda la arena)  
**Fase 3**: Eggman a pie (vulnerable, desesperado) → cutscene  

**Mecánica especial del boss final:**  
Sonic debe lanzar Warp Rings para teletransportarse dentro de la nave de Eggman y atacar su núcleo energético desde dentro.

---

## 8. Diseño de audio

| Elemento | Descripción |
|---|---|
| Música Green Hill | Versión 3D del tema clásico (rock + orquesta) |
| Música Casino Night | Jazz electrónico, bpm 160+ |
| Música Chemical Plant | Techno industrial con sintetizadores |
| Música Ice Cap | Piano + synth ambiental |
| Música Lava Reef | Metal pesado con percusiones |
| Leitmotif de Eggman | Fanfarria de persecución que sube de tono al acercarse |
| SFX anillo recogido | Jingle clásico de Sonic (8-bit + reverb) |
| SFX Warp Ring | Sonido de apertura de portal + whoosh |
| SFX Spindash | Turbina de velocidad + explosión |
| SFX Eggman diálogo | Voz procesada ligeramente robótica |

**Sistema de música reactiva**: El BPM y la intensidad de la música aumentan proporcionalmente a la velocidad de Sonic y a la proximidad de Eggman.

---

## 9. UI / UX

### 9.1 HUD en juego
```
[Anillos: 47]        [Green Hill Zone]        [Portales: 3]
                                                             
                                                  [Mini-mapa]
                                                  (esquina inf.
                                                   derecha)
                                               
[Barra de Spindash]          [Indicador Eggman: ← 120m]
```

### 9.2 Mapa de pausa
- Vista aérea del mundo con zonas conectadas
- Indicador de posición de Sonic (punto azul)
- Indicador de posición de Eggman (punto rojo parpadeante)
- Porcentaje de completitud de cada zona
- Fast travel a zonas visitadas

### 9.3 Pantalla de resultados por zona
- Anillos recogidos / total
- Badniks destruidos
- Tiempo transcurrido
- Rango: D → C → B → A → S (tiempo + anillos + combos)

---

## 10. Cámara

| Modo | Descripción | Trigger |
|---|---|---|
| **Follow** (default) | Cámara detrás de Sonic, orbita suavemente | Siempre |
| **Speed Cam** | FOV aumenta a 90, cámara se aleja | Velocidad > 80% máx |
| **Cinematic** | Plano lateral durante loops y rampas | Automático en puntos definidos |
| **Lock-on** | Apunta a Badnik más cercano | Botón Z / clic derecho |
| **Boss Cam** | Alterna entre Sonic y Eggman dramáticamente | Durante boss fights |

Controles de cámara: **Arrastrar ratón** (órbita horizontal/vertical) | **Scroll** (zoom)

---

## 11. Controles

| Acción | Teclado | Gamepad |
|---|---|---|
| Mover | WASD / Flechas | Stick izquierdo |
| Saltar | Espacio / A | Botón A / × |
| Spindash (carga) | Shift | Botón B / ○ (hold) |
| Homming Attack | Espacio en aire | A / × en aire |
| Lanzar Warp Ring | Clic izquierdo | Gatillo derecho |
| Girar cámara | Arrastrar ratón | Stick derecho |
| Mapa / Pausa | Escape / Tab | Start |
| Fast Travel | Tab + clic en zona | Select + A |
| Light Speed Dash | Doble clic | Gatillo izquierdo |

---

## 12. Arquitectura técnica

### 12.1 Stack
```
Renderer:     Three.js r160 + WebGPU (fallback WebGL2)
Física:       Custom (no Cannon.js) — optimizada para velocidad Sonic
Audio:        Web Audio API + Howler.js
Estado:       Zustand (si se migra a React) / vanilla módulos ES
Assets:       GLTF/GLB para modelos finales
Shaders:      GLSL custom para cel-shading y speed blur
```

### 12.2 Rendimiento objetivo
| Dispositivo | FPS objetivo | Resolución |
|---|---|---|
| Desktop high-end | 60 fps estables | 1440p / 4K |
| Desktop mid-range | 60 fps | 1080p |
| Laptop integrada | 30+ fps | 720p |
| Mobile (futuro) | 30 fps | 720p |

### 12.3 LOD (Level of Detail)
- Sonic: LOD 0 (< 15u), LOD 1 (15–40u), LOD 2 (> 40u)
- Badniks: LOD 0 (< 20u), billboard (> 40u)
- Eggman: Sin LOD (siempre alta calidad)
- Mundo: Chunks de 40×40u con carga/descarga dinámica

### 12.4 Estructura de archivos (producción)
```
/src
  /characters
    sonic.js        — modelo + animaciones
    eggman.js       — modelo + IA (EPE)
    badniks.js      — tipos de enemigos
  /zones
    greenhill.js
    casino.js
    chemplant.js
    icecap.js
    lavareef.js
    eggfortress.js
  /systems
    physics.js      — motor de física custom
    warpring.js     — mecánica de portal
    camera.js       — todos los modos de cámara
    audio.js        — música reactiva
    progression.js  — desbloqueos y guardar
  /ui
    hud.js
    map.js
    menus.js
  /shaders
    celshading.glsl
    speedblur.glsl
    portal.glsl
  main.js           — game loop principal
```

---

## 13. Roadmap de desarrollo

### Milestone 1 — Prototipo jugable (4 semanas)
- [ ] Motor de física de Sonic (velocidad, spindash, salto)
- [ ] Modelo 3D de Sonic con animaciones base
- [ ] Zona Green Hill funcional
- [ ] Sistema de anillos coleccionables
- [ ] Cámara follow con órbita

### Milestone 2 — Core loop completo (8 semanas)
- [ ] IA de Eggman (EPE, fases 1–4)
- [ ] Sistema de Warp Ring con portales
- [ ] 3 zonas adicionales (Casino, Chemical, Ice Cap)
- [ ] Sistema de progresión y desbloqueos
- [ ] HUD completo + mapa de pausa

### Milestone 3 — Contenido completo (12 semanas)
- [ ] Lava Reef + Egg Fortress
- [ ] Boss fights de Eggman (3 fases)
- [ ] Super Sonic (7 Chaos Emeralds)
- [ ] Sistema de audio reactivo
- [ ] Cel-shading y efectos visuales finales

### Milestone 4 — Polish y lanzamiento (16 semanas)
- [ ] Optimización de rendimiento (LOD, chunks)
- [ ] Gamepad support
- [ ] Leaderboards globales
- [ ] Modo contrarreloj
- [ ] Pruebas de usuario y ajuste de dificultad de Eggman

---

## 14. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Física de Sonic difícil de afinar | Alto | Iterar con playtesters desde M1; referencia Sonic Generations |
| IA de Eggman demasiado frustrante | Alto | Sistema de dificultad adaptativa; cooldowns entre ataques |
| Rendimiento en mundo abierto | Medio | Chunks dinámicos, LOD agresivo, Web Workers para IA |
| Coherencia visual entre zonas | Medio | Design system de materiales compartido; guía de estilo de shaders |
| Scope creep (más zonas, más features) | Medio | Congelar scope en M2; extras van a DLC post-lanzamiento |

---

*Documento generado para el equipo de desarrollo de Sonic 3D Open World.*  
*Siguiente paso: Validar milestone 1 con prototipo jugable en navegador.*
