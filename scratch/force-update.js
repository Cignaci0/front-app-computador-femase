const fs = require('fs');
let code = fs.readFileSync('../api-app-computador-femase/src/computador/computador.service.ts', 'utf8');

code = code.replace(
  'return "dispositivo actualizado con exito";',
  'await this.computadorRepo.update(id, { upgrade: false });\n    return "dispositivo actualizado con exito";'
);

fs.writeFileSync('../api-app-computador-femase/src/computador/computador.service.ts', code);
console.log('Replaced?', code.includes('upgrade: false'));
