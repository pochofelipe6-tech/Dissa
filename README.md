# DISSA Shoes — código local

Sitio en HTML, CSS y JavaScript. Para navegar no necesitas instalar dependencias:

```powershell
npm.cmd start
```

Abre http://localhost:3000. También puedes servir `dist` con Live Server de VS Code.

## Archivos principales

- `dist/index.html`: portada, catálogo, Universo DISSA, guía de compra y ventanas de consulta.
- `dist/style.css`: estilos base.
- `dist/redesign.css`: portada y navegación.
- `dist/collection.css`: catálogo oscuro, ficha de producto, WhatsApp, Universo DISSA, guía y adaptación móvil.
- `dist/app.js`: filtros, búsqueda, orden, favoritos, galería, zoom, preferencias y pedido por WhatsApp.
- `dist/catalog.json`: 56 referencias tomadas de la carpeta compartida.
- `dist/assets/`: fotos originales y recursos de presentación.

## Imágenes

Las fotos originales del catálogo se conservan. Los recortes de presentación se vinculan por ID en `presentationImages`, al principio de `app.js`, y se identifican dentro de cada ficha. La foto original queda disponible en la galería y en su enlace a Drive. La imagen de Universo DISSA es una composición editorial generada como inspiración de estilo; no representa inventario.

## Pedidos por WhatsApp

Todos los pedidos se realizan por WhatsApp al +57 300 426 6385. La ficha de cada producto ofrece «Pedir por WhatsApp» y prepara un mensaje con referencia, enlace a la foto original, talla y cantidad. El cliente revisa y envía el mensaje desde WhatsApp. No hay carrito ni pagos en la web. Los corazones guardan favoritos en el navegador.

## Verificación

`npm.cmd run check` revisa la sintaxis. Para las pruebas de interfaz, instala las dependencias de desarrollo con `npm.cmd install`, deja el servidor funcionando y ejecuta `npm.cmd run test:ui`. Las pruebas usan Microsoft Edge instalado en Windows y verifican filtros, galería, favoritos, enlace de WhatsApp con talla y cantidad, guía y desbordamiento móvil a 320 y 390 px.

El logo de cabecera y pie se encuentra en dist/assets/dissa-logo.png. Se integra sobre el fondo oscuro conservando sus proporciones.

Los iconos usan dist/icon-motion.css y dist/icon-motion.js: entrada escalonada al aparecer, respuesta al cursor, toque y teclado; respetan la preferencia de movimiento reducido.

La interfaz Neon World se ajusta en dist/neon-stage.css. El escenario decorativo está en dist/assets/neon-stage-v4.png; el zapato, el selector y la ficha flotante siguen siendo elementos interactivos independientes.

El humo morado se dibuja y anima en canvas mediante dist/scene-motion.js. Se pausa fuera de pantalla y cuando la pestaña está oculta. Las entradas y los efectos hover de tarjetas, fotos y botones se ajustan en dist/scene-motion.css y respetan el movimiento reducido.
