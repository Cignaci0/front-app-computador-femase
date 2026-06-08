const fs = require('fs');

// 1. Update mantencion.service.ts
let mantencionCode = fs.readFileSync('../api-app-computador-femase/src/mantencion/mantencion.service.ts', 'utf8');

const targetMantencion1 = `await this.mantencionRepository.manager.update(Computador, idComputador, { fecha_ultima_mantencion: fechaReal });`;
const replacementMantencion1 = `const payloadComp: any = { fecha_ultima_mantencion: fechaReal };
      if (mantencion.upgrade) payloadComp.upgrade = true;
      await this.mantencionRepository.manager.update(Computador, idComputador, payloadComp);`;

const targetMantencion2 = `await this.mantencionRepository.manager.update(Equipo, idEquipo, { fecha_ultima_mantencion: fechaReal });`;
const replacementMantencion2 = `const payloadEq: any = { fecha_ultima_mantencion: fechaReal };
      if (mantencion.upgrade) payloadEq.upgrade = true;
      await this.mantencionRepository.manager.update(Equipo, idEquipo, payloadEq);`;

mantencionCode = mantencionCode.replace(targetMantencion1, replacementMantencion1);
mantencionCode = mantencionCode.replace(targetMantencion2, replacementMantencion2);

fs.writeFileSync('../api-app-computador-femase/src/mantencion/mantencion.service.ts', mantencionCode);
console.log('Updated mantencion.service.ts');

// 2. Update computador.service.ts
let computadorCode = fs.readFileSync('../api-app-computador-femase/src/computador/computador.service.ts', 'utf8');
const targetComputador = `    const processedDto = {
      ...updateComputadorDto,`;
const replacementComputador = `    const processedDto = {
      ...updateComputadorDto,
      upgrade: false,`;

computadorCode = computadorCode.replace(targetComputador, replacementComputador);
fs.writeFileSync('../api-app-computador-femase/src/computador/computador.service.ts', computadorCode);
console.log('Updated computador.service.ts');
