// Nivel 4: validación con el módulo validaciones.js, envío con fetch,
// correo asíncrono con debounce y teléfonos dinámicos.

import { validarCampo, validarFormulario } from './validaciones.js';

const form = document.querySelector('#registro');
const boton = form.querySelector('button[type="submit"]');
const mensaje = document.querySelector('#mensaje');

function debounce(fn, ms) {
  let espera;
  return (...args) => {
    clearTimeout(espera);
    espera = setTimeout(() => fn(...args), ms);
  };
}

// ---------- Lectura de datos (incluye teléfonos como lista) ----------

function leerDatos() {
  const datos = Object.fromEntries(new FormData(form));
  datos.telefono = new FormData(form).getAll('telefono');
  return datos;
}

// ---------- Mostrar / limpiar errores ----------

function mostrarError(nombre, texto) {
  const campo = form.elements[nombre];
  const error = document.getElementById(`${nombre}-error`);
  if (campo && 'setAttribute' in campo) campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
  if (error) error.textContent = texto ?? '';
}

form.addEventListener('focusout', (e) => {
  if (!e.target.name || e.target.name === 'telefono') return;
  mostrarError(e.target.name, validarCampo(e.target.name, leerDatos()));
});

// ---------- Nivel 4 · Parte B: correo asíncrono (¿ya existe?) ----------

const registrados = ['ana@mail.com', 'admin@mail.com'];
const correoDisponible = (email) =>
  new Promise((ok) => setTimeout(() => ok(!registrados.includes(email.toLowerCase())), 600));

const revisarCorreo = debounce(async (email) => {
  if (validarCampo('email', { email })) return; // primero el formato
  mostrarError('email', 'Comprobando disponibilidad…');
  const libre = await correoDisponible(email);
  mostrarError('email', libre ? null : 'Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?');
}, 500);

form.elements.email.addEventListener('input', (e) => revisarCorreo(e.target.value));

// ---------- Nivel 4 · Parte C: teléfonos dinámicos ----------

const lista = document.querySelector('#telefonos');
const agregarTelefono = document.querySelector('#agregar-telefono');

function validarTelefonos() {
  const errorEl = document.getElementById('telefono-error');
  const valores = new FormData(form).getAll('telefono');
  for (const input of lista.querySelectorAll('input[name="telefono"]')) {
    const v = input.value.trim();
    const invalido = v !== '' && !/^\+?\d{7,15}$/.test(v);
    input.setAttribute('aria-invalid', invalido ? 'true' : 'false');
  }
  const algunoInvalido = valores.some((v) => v && !/^\+?\d{7,15}$/.test(v));
  if (errorEl) errorEl.textContent = algunoInvalido ? 'Usa entre 7 y 15 dígitos, con + opcional.' : '';
  return !algunoInvalido;
}

agregarTelefono.addEventListener('click', () => {
  if (lista.children.length >= 3) return;
  const n = lista.children.length + 1;
  const fila = document.createElement('div');
  fila.className = 'fila-telefono';
  fila.innerHTML = `
    <label for="tel-${n}">Teléfono ${n}</label>
    <input id="tel-${n}" name="telefono" type="tel" inputmode="tel" autocomplete="tel">
    <button type="button" class="quitar">Quitar</button>`;
  lista.append(fila);
  fila.querySelector('input').focus();
});

// Delegación de eventos: un solo listener para todos los botones «Quitar»
lista.addEventListener('click', (e) => {
  if (e.target.matches('.quitar')) {
    e.target.closest('.fila-telefono').remove();
    validarTelefonos();
  }
});

lista.addEventListener('focusout', (e) => {
  if (e.target.name === 'telefono') validarTelefonos();
});

// ---------- Envío con fetch + FormData ----------

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = leerDatos();
  const errores = validarFormulario(datos);
  for (const nombre of ['nombre', 'email', 'password', 'confirmar', 'edad', 'pais', 'terminos']) {
    mostrarError(nombre, errores[nombre] ?? null);
  }
  const telefonosOk = validarTelefonos();

  const primerError = form.querySelector('[aria-invalid="true"]');
  if (Object.keys(errores).length > 0 || !telefonosOk) {
    if (primerError) primerError.focus();
    return;
  }

  boton.disabled = true;
  boton.textContent = 'Enviando…';
  try {
    const cuerpo = { ...datos };
    delete cuerpo.confirmar; // no se envía la confirmación

    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const creado = await res.json();
    mensaje.textContent = `¡Cuenta creada! Id: ${creado.id}`;
    form.reset();
    lista.innerHTML = '';
  } catch (err) {
    mensaje.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.';
    console.error(err);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Crear cuenta';
  }
});
