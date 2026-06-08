const fs = require('fs');

// 1. Fix computador.service.ts types
let compCode = fs.readFileSync('../api-app-computador-femase/src/computador/computador.service.ts', 'utf8');

compCode = compCode.replace(
  'if (processedDto.vendido_femase) { processedDto.vencimiento_garantia = null; processedDto.vencimiento_garantia_fecha = null; }',
  'if ((processedDto as any).vendido_femase) { (processedDto as any).vencimiento_garantia = null; (processedDto as any).vencimiento_garantia_fecha = null; }'
);

compCode = compCode.replace(
  'if ((updateComputadorDto as any).vendido_femase) { processedDto.vencimiento_garantia = null; processedDto.vencimiento_garantia_fecha = null; }',
  'if ((updateComputadorDto as any).vendido_femase) { (processedDto as any).vencimiento_garantia = null; (processedDto as any).vencimiento_garantia_fecha = null; }'
);

fs.writeFileSync('../api-app-computador-femase/src/computador/computador.service.ts', compCode);

// 2. Fix reportes.service.ts
let repCode = fs.readFileSync('../api-app-computador-femase/src/reportes/reportes.service.ts', 'utf8');
repCode = repCode.replace(
  'const PdfPrinter = require(\'pdfmake\');',
  '// @ts-ignore\nconst PdfPrinter = require(\'pdfmake\');'
);

fs.writeFileSync('../api-app-computador-femase/src/reportes/reportes.service.ts', repCode);
