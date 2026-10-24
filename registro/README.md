# Registro de usuario — Taller de formularios con validaciones

Formulario de registro construido en 5 niveles: HTML nativo → mensajes propios →
envío con `fetch` → módulo de validación en JavaScript puro → seguridad y usabilidad.

Solo HTML, CSS y JavaScript. Sin librerías ni frameworks.

Para ejecutarlo: abre `registro/index.html` con **Live Server** (los módulos de
`app.js` no funcionan abriendo el archivo con doble clic).

## Nivel 1 — HTML puro con validación nativa

**Pregunta:** ¿qué pasa si borras el atributo `name` de un campo y envías? ¿Por qué?

> Al borrar `name`, el navegador sigue aplicando sus validaciones (`required`,
> `pattern`, etc.) porque dependen del atributo del campo, no de `name`. Pero al
> enviar el formulario, ese campo **no aparece en los datos enviados**
> (`FormData`/`application/x-www-form-urlencoded`), porque `name` es lo que el
> navegador usa como clave para construir el par clave-valor. Sin `name`, el valor
> se pierde y el servidor nunca lo recibe.

## Nivel 2 — Estilos de error y mensajes propios

**Pregunta:** cambia `:user-invalid` por `:invalid`, recarga la página y describe
la diferencia. ¿Cuál es mejor para el usuario y por qué?

> Con `:invalid` el borde rojo aparece **desde que se carga la página**, antes de
> que la persona haya escrito nada, porque campos como `required` son inválidos
> por definición mientras estén vacíos. Con `:user-invalid` el navegador espera a
> que el usuario **interactúe** con el campo (lo toque y salga de él, o intente
> enviar) antes de marcarlo en rojo. `:user-invalid` es mejor para el usuario:
> evita que el formulario se vea "lleno de errores" antes de empezar a llenarlo,
> que es una mala experiencia y genera ansiedad innecesaria.

## Nivel 3 — Envío con fetch + FormData

**Pregunta:** ¿por qué se escucha `submit` en el formulario y no `click` en el botón?

> El evento `submit` se dispara con cualquier forma de enviar el formulario: clic
> en el botón, tecla **Enter** dentro de un campo de texto, o `form.requestSubmit()`
> desde JavaScript. Si solo escucháramos `click` en el botón, enviar con Enter
> saltaría toda la validación y el `fetch`, porque Enter dispara `submit`
> directamente sin pasar por un `click` en el botón.

## Nivel 4 — Validación avanzada en JavaScript puro

**Pregunta:** ¿qué ventaja tiene que las reglas sean funciones puras?

> Al no tocar el DOM ni depender de nada externo (solo reciben un valor y
> devuelven un mensaje o `null`), las reglas se pueden **probar de forma aislada**
> (sin montar HTML ni un navegador), **reutilizar** en otro formulario o incluso
> en el backend, y **componer** fácilmente (una lista de reglas por campo). También
> son más fáciles de razonar: mismo valor de entrada, siempre el mismo resultado.

**Pregunta:** ¿por qué la validación "correo ya existe" no se puede hacer solo con
atributos HTML?

> Porque esa regla depende de un dato que **no existe en el navegador**: la lista
> de correos ya registrados vive en el servidor (o una base de datos). Los
> atributos HTML (`required`, `pattern`, `min`, `max`...) solo pueden evaluar el
> valor del campo contra reglas fijas conocidas de antemano; no pueden hacer una
> consulta a un servidor. Esa validación necesita JavaScript (para disparar la
> petición) y una API/servidor que responda si el dato ya existe.

## Nivel 5 — Seguridad y usabilidad

### Parte A — La validación del frontend no es seguridad

1. Al borrar `min`/`max` del campo Edad en DevTools y enviar `edad = 5`: **sí
   llega al servidor**, porque esos límites solo existen en el HTML que el
   navegador interpreta; quitarlos (o directamente editar el DOM) no cambia nada
   del lado del servidor.
2. Al enviar directamente con `fetch` en la consola (`email: 'no-es-correo'`,
   `edad: -3`), la API de prueba (`jsonplaceholder`) responde igual con un
   `id` creado — no valida nada, porque es un endpoint de ejemplo sin reglas.

**Pregunta:** ¿qué demuestra esto y qué debe hacer el backend?

> Demuestra que **toda validación del lado del cliente (HTML o JavaScript) es
> solo una ayuda de experiencia de usuario**, no una barrera de seguridad: puede
> saltarse editando el DOM, desactivando JavaScript, o llamando directamente a la
> API con `fetch`, Postman, `curl`, etc. El backend **debe revalidar todos los
> datos con el mismo esquema** (longitud, formato, rangos, obligatoriedad) antes
> de guardarlos, y usar **consultas parametrizadas**: el texto SQL y los valores
> viajan por canales separados al motor de base de datos, así un valor como
> `' OR '1'='1` se trata siempre como un dato literal y nunca como código SQL
> ejecutable. Esto es lo que evita la inyección SQL, sin importar qué validación
> exista (o no) en el frontend.

### Parte B — Mostrar datos sin abrir la puerta a XSS

Probado escribiendo `<b>Ana</b>` como nombre:

> Con `innerHTML`, el navegador **interpreta** el texto como HTML, así que
> `<b>Ana</b>` se renderiza en negrita — y cualquier persona podría inyectar
> `<script>` o `<img onerror=...>` y ejecutar código en la página de otros
> usuarios (XSS). Con `textContent`, el navegador **nunca interpreta** el valor
> como marcado: `<b>Ana</b>` se muestra literalmente como texto, incluidos los
> símbolos `<` y `>`. Por eso el saludo final del formulario (`app.js`) usa
> `saludo.textContent = ...` y no `innerHTML`. Revisé el resto del código: el
> único `innerHTML` que queda es el de las filas de teléfono dinámicas, y es
> seguro porque el texto que inserta (`Teléfono ${n}`) lo genera el propio
> código, nunca algo escrito por el usuario.

### Parte C — Prueba de usabilidad con un compañero

| Observación | Campo | Problema | Corrección aplicada |
|---|---|---|---|
| 1 | _(completar tras la prueba)_ | | |
| 2 | _(completar tras la prueba)_ | | |

> Pendiente: ejecutar la prueba con un compañero (tarea con un dato inválido a
> propósito, p. ej. edad 16; repetir solo con teclado) y completar la tabla de
> arriba con lo observado y la corrección aplicada en el código.

## Entrega

- [x] Carpeta `registro/` con `index.html`, `estilos.css`, `app.js` y `validaciones.js`.
- [x] Ninguna librería ni framework: solo HTML, CSS y JavaScript.
- [x] `README.md` con la tabla de usabilidad y las respuestas a las preguntas de cada nivel.
- [ ] Enlace al repositorio enviado antes del plazo: **[completar]**.
