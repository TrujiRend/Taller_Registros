// Nivel 2: mensajes de error propios con la Constraint Validation API.

const form = document.querySelector('#registro');

function mensajePara(input) {
  const v = input.validity;
  if (v.valueMissing) return 'Este campo es obligatorio.';
  if (v.typeMismatch) return 'Escribe un correo válido, por ejemplo ana@mail.com.';
  if (v.tooShort) return `Usa al menos ${input.minLength} caracteres.`;
  if (v.rangeUnderflow) return `El valor mínimo es ${input.min}.`;
  if (v.rangeOverflow) return `El valor máximo es ${input.max}.`;
  if (v.patternMismatch) {
    if (input.name === 'password') {
      return 'Usa al menos 8 caracteres, con una letra y un número.';
    }
    return 'El formato no es válido.';
  }
  if (v.stepMismatch) return 'Escribe un número entero.';
  if (v.customError) return input.validationMessage;
  return '';
}

function validarCampo(input) {
  const error = document.getElementById(`${input.id}-error`);
  if (error) error.textContent = mensajePara(input);
}

function validarConfirmacion() {
  const pass = form.elements.password;
  const conf = form.elements.confirmar;
  conf.setCustomValidity(
    conf.value && conf.value !== pass.value ? 'Las contraseñas no coinciden.' : ''
  );
}

// Validar al salir del campo (evento blur), no a cada tecla
form.addEventListener('focusout', (e) => {
  if (e.target.name === 'password' || e.target.name === 'confirmar') validarConfirmacion();
  if (e.target.willValidate) validarCampo(e.target);
});
