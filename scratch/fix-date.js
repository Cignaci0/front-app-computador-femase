const fs = require('fs');
let code = fs.readFileSync('../api-app-computador-femase/src/computador/computador.service.ts', 'utf8');

// For create
code = code.replace(
  'if (processedDto.estado === "ENTREGADO" && processedDto.vencimiento_garantia != null) {',
  'if (processedDto.vendido_femase) { processedDto.vencimiento_garantia = null; processedDto.vencimiento_garantia_fecha = null; }\n    if (processedDto.estado === "ENTREGADO" && processedDto.vencimiento_garantia != null && !processedDto.vendido_femase) {'
);

// For update
code = code.replace(
  'if (updateComputadorDto.estado === "ENTREGADO" && updateComputadorDto.vencimiento_garantia != null) {',
  'if ((updateComputadorDto as any).vendido_femase) { processedDto.vencimiento_garantia = null; processedDto.vencimiento_garantia_fecha = null; }\n    if (updateComputadorDto.estado === "ENTREGADO" && updateComputadorDto.vencimiento_garantia != null && !(updateComputadorDto as any).vendido_femase) {'
);

fs.writeFileSync('../api-app-computador-femase/src/computador/computador.service.ts', code);
console.log('Replaced?', code.includes('processedDto.vencimiento_garantia_fecha = null;'));
