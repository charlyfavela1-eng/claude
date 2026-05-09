# PRD — Virtual Try-On App
**Versión:** 1.0  
**Fecha:** 2026-05-09  
**Estado:** Draft  

---

## 1. Resumen ejecutivo

Aplicación web y móvil que permite a cualquier usuario probarse ropa virtualmente usando la cámara de su dispositivo e inteligencia artificial. El usuario apunta la cámara hacia sí mismo (o sube una foto), elige prendas de un catálogo, y ve en tiempo real cómo le quedaría la ropa — sin desvestirse, sin probadores, sin fricción.

**Propuesta de valor central:**  
> "Pruébate cualquier prenda en 3 segundos, desde donde estás."

---

## 2. Problema

| Dolor | Magnitud |
|---|---|
| 30–40 % de compras online se devuelven por talla o aspecto | Alto impacto económico para marcas |
| Los probadores físicos generan fricción y abandono de compra | Pérdida de conversión en tienda |
| Las guías de tallas son ambiguas y no consideran el cuerpo real del usuario | Alta insatisfacción post-compra |
| No existe una solución de try-on precisa, rápida y sin fricción para marcas medianas | Gap de mercado |

---

## 3. Objetivos del producto

### OKRs — Ciclo 1 (0–6 meses)

| Objetivo | Key Result |
|---|---|
| Reducir tasa de devoluciones | < 15 % en órdenes con try-on usado (vs. ~35 % sector) |
| Aumentar conversión | +25 % tasa de añadir al carrito tras try-on |
| Tiempo de adopción | Try-on activo en < 30 s desde que el usuario llega |
| Precisión del modelo | Score de satisfacción visual ≥ 4.2 / 5 en encuesta post-uso |

---

## 4. Usuarios objetivo

### Segmento primario — Comprador final
- **Perfil:** 18–40 años, compra ropa online ≥ 2 veces/mes
- **Dispositivo:** Smartphone (70 %) o laptop con webcam (30 %)
- **Pain point:** No sabe si la ropa le quedará bien antes de comprar
- **Motivación:** Ahorrarse el proceso de devolver

### Segmento secundario — Marca / retailer
- **Perfil:** eCommerce de moda con catálogo digital, 50–5000 SKUs
- **Pain point:** Alto coste de devoluciones, baja conversión en móvil
- **Motivación:** Reducir devoluciones, diferenciarse competitivamente

### Segmento terciario — Influencer / creador
- **Perfil:** Crea contenido de moda, comparte outfits
- **Motivación:** Probar combinaciones rápido sin gastar en ropa física

---

## 5. Alcance MVP

### 5.1 Dentro del MVP

- Acceso a cámara en tiempo real (stream de video)
- Modo foto: subir imagen o tomar foto
- Try-on de tops, camisas, chaquetas, vestidos (prendas superiores primero)
- Catálogo demo con 50+ prendas de prueba
- Selector de talla con estimación basada en altura/peso declarados
- Compartir resultado (screenshot) a redes sociales
- Widget embebible para marcas (iframe + JS snippet)
- Panel de marca: subir catálogo, ver métricas de try-on

### 5.2 Fuera del MVP (backlog)

- Try-on de pantalones, zapatos, accesorios
- Try-on en video en tiempo real (overlay continuo)
- Recomendación de talla por IA basada en compras previas
- Try-on colaborativo (compartir sesión con amigo)
- Integración directa con Shopify / WooCommerce / VTEX
- App nativa iOS / Android
- Try-on con avatar 3D generado desde el usuario

---

## 6. Flujos de usuario

### Flujo 1 — Try-on desde cámara (usuario final)

```
Llega al producto en eCommerce
       ↓
Hace clic en "Probarme esta prenda"
       ↓
Solicitud de permiso de cámara → Acepta
       ↓
Ve su imagen en vivo en el visor
       ↓
IA detecta cuerpo y postura (< 1 s)
       ↓
La prenda se superpone sobre su cuerpo
       ↓
Ajusta talla con slider (XS → XXL)
       ↓
Prueba colores / variantes sin re-captura
       ↓
Toma screenshot o graba clip corto
       ↓
Comparte o añade al carrito
```

### Flujo 2 — Try-on desde foto

```
Sube foto o usa foto de perfil
       ↓
IA segmenta silueta y detecta puntos corporales
       ↓
Muestra prenda superpuesta en la foto
       ↓
Controles de ajuste fino (posición, escala)
       ↓
Descarga imagen resultante
```

### Flujo 3 — Marca sube catálogo

```
Registro en panel de marca
       ↓
Sube imágenes de prendas (fondo blanco o maniquí)
       ↓
IA procesa y extrae máscara de la prenda
       ↓
Configura parámetros (tallas disponibles, colores)
       ↓
Obtiene snippet de código para embed
       ↓
Pega en su tienda online → try-on activo
```

---

## 7. Stack tecnológico recomendado

### Frontend
| Capa | Tecnología | Razón |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, SEO, performance |
| Estilos | Tailwind CSS | Velocidad de desarrollo |
| Cámara | MediaDevices API + WebRTC | Nativo en browser, sin plugins |
| Canvas / overlay | WebGL + Three.js | Render en tiempo real |
| Estado | Zustand | Ligero, reactivo |

### IA / Computer Vision
| Función | Tecnología | Notas |
|---|---|---|
| Detección de pose corporal | MediaPipe Pose (Google) | Corre en browser, 30 fps, sin servidor |
| Segmentación de persona | MediaPipe Selfie Segmentation | Separa fondo del usuario |
| Segmentación de prenda | SAM 2 (Meta) vía API | Extrae máscara de prenda desde imagen |
| Deformación de prenda sobre cuerpo | TPS Warping + DensePose | Adapta la prenda a la silueta real |
| Try-on fotorrealista | IDM-VTON o OOTDiffusion (Diffusion-based) | Genera imagen de alta calidad |
| Estimación de talla | Modelo custom (regresión) | Predice talla desde puntos de pose |

### Backend
| Capa | Tecnología |
|---|---|
| API | Next.js API Routes + tRPC |
| Base de datos | PostgreSQL (Supabase) + Prisma |
| Storage de imágenes | Cloudflare R2 / S3 |
| Cola de procesamiento IA | BullMQ + Redis (Upstash) |
| Inference IA | Modal.com o Replicate (GPU serverless) |
| Auth | NextAuth v5 (Google + Magic Link) |
| CDN | Cloudflare |

### Infraestructura
| Servicio | Plataforma |
|---|---|
| Frontend / API | Vercel |
| Workers IA | Modal.com (A100 GPU on-demand) |
| DB | Supabase |
| Redis | Upstash |
| Imágenes procesadas | Cloudflare R2 |

---

## 8. Arquitectura de la IA

### Pipeline de try-on (modo foto — alta calidad)

```
Input: foto usuario + imagen prenda
           ↓
[1] Detección de pose (MediaPipe) → 33 keypoints
           ↓
[2] Segmentación de persona (SAM 2) → máscara binaria
           ↓
[3] Segmentación de prenda (SAM 2) → máscara prenda
           ↓
[4] Parsing de ropa (ATR / CIHP) → región de torso
           ↓
[5] Warping (TPS Transform) → deforma prenda a silueta
           ↓
[6] Diffusion refinement (OOTDiffusion) → fusión fotorrealista
           ↓
Output: imagen con prenda puesta (~3–8 s en GPU)
```

### Pipeline en tiempo real (modo cámara — baja latencia)

```
Stream de webcam a 30 fps
           ↓
[1] MediaPipe Pose → keypoints en < 20 ms (WebAssembly)
           ↓
[2] MediaPipe Segmentation → máscara de persona
           ↓
[3] Anchor points: hombros, cadera, cuello
           ↓
[4] Affine transform de la prenda sobre anchor points
           ↓
[5] Blend mode overlay (multiply / normal) con opacidad
           ↓
Output: overlay suave en canvas WebGL a 30 fps
```

> **Nota:** El modo tiempo real es un overlay geométrico (no diffusion) — más rápido pero menos fotorrealista. El modo foto usa el pipeline completo con GPU.

---

## 9. Schema de base de datos

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  image       String?
  height      Int?     // cm
  weight      Int?     // kg
  bodyShape   String?  // hourglass | rectangle | pear | apple | inverted_triangle
  trySessions TrySession[]
  savedLooks  SavedLook[]
  accounts    Account[]
  sessions    Session[]
  createdAt   DateTime @default(now())
}

model Brand {
  id          String    @id @default(cuid())
  name        String
  domain      String    @unique
  logoUrl     String?
  plan        String    @default("starter") // starter | pro | enterprise
  apiKey      String    @unique @default(cuid())
  garments    Garment[]
  createdAt   DateTime  @default(now())
}

model Garment {
  id              String   @id @default(cuid())
  brandId         String
  name            String
  category        String   // top | bottom | dress | jacket | outerwear
  subcategory     String?  // tshirt | shirt | hoodie | blazer ...
  imageUrl        String   // imagen original (fondo blanco / maniquí)
  maskUrl         String?  // máscara procesada por IA
  processedUrl    String?  // prenda recortada y normalizada
  colors          Json     // [{ name: "Rojo", hex: "#FF0000", imageUrl: "..." }]
  sizes           String[] // ["XS","S","M","L","XL","XXL"]
  price           Float?
  productUrl      String?  // URL en la tienda de la marca
  isProcessed     Boolean  @default(false)
  trySessions     TrySession[]
  brand           Brand    @relation(fields: [brandId], references: [id])
  createdAt       DateTime @default(now())
}

model TrySession {
  id            String   @id @default(cuid())
  userId        String?
  garmentId     String
  inputPhotoUrl String?  // foto del usuario (si usó modo foto)
  resultUrl     String?  // imagen resultante del try-on
  sizeSelected  String?
  colorSelected String?
  mode          String   // camera | photo
  rating        Int?     // 1-5 (feedback del usuario)
  addedToCart   Boolean  @default(false)
  shared        Boolean  @default(false)
  processingMs  Int?     // tiempo de procesamiento
  user          User?    @relation(fields: [userId], references: [id])
  garment       Garment  @relation(fields: [garmentId], references: [id])
  createdAt     DateTime @default(now())
}

model SavedLook {
  id         String   @id @default(cuid())
  userId     String
  resultUrl  String
  garmentIds String[]
  notes      String?
  user       User     @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())
}
```

---

## 10. API — Endpoints principales

### Try-on
```
POST /api/tryon/photo
  body: { garmentId, userPhotoBase64, size, color }
  returns: { jobId, estimatedSeconds }

GET  /api/tryon/status/:jobId
  returns: { status: "processing"|"done"|"failed", resultUrl? }

POST /api/tryon/camera-frame
  body: { garmentId, frameBase64, poseKeypoints }
  returns: { overlayTransform: { x, y, scale, rotation } }
```

### Catálogo
```
GET  /api/garments?category=top&brandId=xxx
POST /api/garments (brand auth)
GET  /api/garments/:id
```

### Marca
```
POST /api/brand/upload-garment
POST /api/brand/process-garment/:id  ← dispara pipeline IA
GET  /api/brand/analytics
```

---

## 11. Componentes de UI

### Widget de Try-On (embed)
```
┌─────────────────────────────────────────┐
│  [📷 Usar cámara]  [🖼 Subir foto]      │
├─────────────────────────────────────────┤
│                                         │
│         VISOR PRINCIPAL                 │
│   (cámara en vivo / foto del usuario)   │
│                                         │
│   ┌─────────────────────────────┐       │
│   │    PRENDA SUPERPUESTA       │       │
│   └─────────────────────────────┘       │
│                                         │
├─────────────────────────────────────────┤
│  Talla: [XS] [S] [M✓] [L] [XL]        │
│  Color: 🔴 🔵 ⚫ 🟤                    │
├─────────────────────────────────────────┤
│  [📸 Capturar]  [↗ Compartir]          │
│  [🛒 Añadir al carrito]                │
└─────────────────────────────────────────┘
```

### Dashboard de marca
```
┌──────────────────────────────────────────────────┐
│  Métricas hoy                                     │
│  Try-ons: 1,234  │  Conversión: 28%  │  Rating: 4.3│
├──────────────────────────────────────────────────┤
│  Catálogo de prendas                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  │ 🔄 │ │ ✓  │ │ ✓  │ │ ⏳ │  [+ Subir prenda] │
│  └────┘ └────┘ └────┘ └────┘                    │
│  Procesando  Lista  Lista  En cola                │
├──────────────────────────────────────────────────┤
│  Snippet de integración                           │
│  <script src="tryon.js" data-brand="xxx"/>        │
│  [Copiar] [Ver docs]                             │
└──────────────────────────────────────────────────┘
```

---

## 12. Criterios de aceptación

### Must have (MVP bloqueante)
- [ ] Cámara activa en < 2 s tras dar permiso
- [ ] Detección de pose funciona con luz normal de interior
- [ ] Overlay de prenda se actualiza en < 100 ms al moverse
- [ ] Modo foto procesa y muestra resultado en < 10 s
- [ ] Selector de talla ajusta visualmente la prenda
- [ ] Screenshot descargable en un clic
- [ ] Widget funciona embebido en sitio externo
- [ ] Marca puede subir prenda y tenerla lista en < 2 min

### Should have
- [ ] Funciona en Safari iOS (cámara + WebGL)
- [ ] Score de calidad visual ≥ 4 / 5 en test con usuarios
- [ ] Modo sin cámara (solo foto) para dispositivos sin permiso
- [ ] Estimación de talla sugerida basada en altura + peso

### Won't have (MVP)
- [ ] Try-on de pantalones / zapatos
- [ ] App nativa
- [ ] Video try-on con diffusion en tiempo real

---

## 13. Métricas de éxito

| Métrica | Baseline | Target MVP (6 meses) |
|---|---|---|
| Tasa de devolución (usuarios con try-on) | — | < 18 % |
| Conversión try-on → carrito | — | > 22 % |
| Tiempo hasta primer try-on | — | < 45 s |
| NPS del widget | — | > 40 |
| Prendas procesadas por marca | — | < 90 s por prenda |
| Uptime del servicio | — | 99.5 % |
| Latencia modo cámara | — | < 80 ms p95 |
| Latencia modo foto | — | < 8 s p95 en GPU |

---

## 14. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Precisión baja en cuerpos no normativos | Alta | Alto | Entrenar con dataset diverso; feedback loop con usuarios |
| Latencia inaceptable en GPU serverless | Media | Alto | Cache de prendas pre-procesadas; warm pools de GPU |
| Safari bloquea cámara en iOS con restrictiones | Media | Medio | Modo foto como fallback; guía de permisos explícita |
| Modelo de diffusion produce artefactos | Alta | Medio | Human-in-the-loop review para catálogos de marca; umbral de calidad |
| Privacidad: usuarios preocupados por fotos | Media | Alto | Procesamiento on-device cuando posible; sin almacenamiento sin consentimiento; borrado automático tras sesión |
| Costo de GPU en escala | Media | Medio | Cache agresivo de resultados; cobro por try-on en plan básico |

---

## 15. Plan de lanzamiento

### Fase 0 — Validación (semanas 1–3)
- Prototipo HTML/JS con overlay geométrico básico (sin IA)
- Test con 20 usuarios: ¿la propuesta tiene sentido? ¿el overlay es suficiente?
- Definir 3 marcas piloto

### Fase 1 — MVP técnico (semanas 4–10)
- Integrar MediaPipe Pose + Segmentation
- Pipeline de foto con OOTDiffusion en Modal.com
- Widget embebible funcional
- Panel de marca básico (subir prenda, obtener snippet)

### Fase 2 — MVP de producto (semanas 11–16)
- Onboarding de 3 marcas piloto
- Recoger feedback → iterar modelo y UX
- Métricas de conversión vs. control A/B
- Pricing y contratos

### Fase 3 — Go-to-market (semanas 17–24)
- Lanzamiento público
- Integraciones Shopify / WooCommerce
- Plan self-serve para marcas
- App nativa (si el canal lo justifica)

---

## 16. Pricing (borrador)

| Plan | Precio | Try-ons/mes | Prendas | SLA |
|---|---|---|---|---|
| Starter | $0 | 500 | 20 | — |
| Growth | $149/mes | 10,000 | 200 | Email 24 h |
| Pro | $499/mes | 50,000 | 1,000 | Chat 8 h |
| Enterprise | Custom | Ilimitado | Ilimitado | Dedicado |

> Modelo de monetización alternativo: cobro por try-on ($0.03–0.08 / try-on exitoso), alineado con el valor que genera.

---

## 17. Equipo mínimo requerido

| Rol | Dedicación |
|---|---|
| Product Manager | 1 × full-time |
| ML Engineer (Computer Vision) | 1–2 × full-time |
| Frontend Engineer (WebGL / React) | 1 × full-time |
| Backend Engineer | 1 × full-time |
| UX Designer | 0.5 × part-time |
| QA / Testing | 0.5 × part-time |

---

## 18. Dependencias externas

| Dependencia | Tipo | Alternativa |
|---|---|---|
| OOTDiffusion / IDM-VTON | Modelo open-source | Kling AI API, Fashn.ai API |
| Modal.com (GPU serverless) | Infraestructura | Replicate, RunPod, AWS SageMaker |
| MediaPipe | SDK Google (open-source) | TensorFlow.js BlazePose |
| Supabase | BaaS | Neon + self-hosted auth |
| Cloudflare R2 | Storage | AWS S3 |

---

*Próximos pasos: validar pipeline técnico con prototipo de baja fidelidad → definir marcas piloto → estimar costos de GPU a escala.*
