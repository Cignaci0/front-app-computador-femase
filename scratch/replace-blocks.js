const fs = require('fs');

let code = fs.readFileSync('components/forms/equipment-form-dialog-new.tsx', 'utf8');

function replaceBlock(startStr, endStr, replacement) {
  const startIdx = code.indexOf(startStr);
  if (startIdx === -1) {
    console.log("Could not find start:", startStr);
    return;
  }
  const endIdx = code.indexOf(endStr, startIdx);
  if (endIdx === -1) {
    console.log("Could not find end:", endStr);
    return;
  }
  const exactEndIdx = endIdx + endStr.length;
  code = code.substring(0, startIdx) + replacement + code.substring(exactEndIdx);
}

replaceBlock(
  '<Select value={tipoDeEquipoId}',
  '</Select>',
  '<AsyncCombobox value={tipoDeEquipoId} onValueChange={setTipoDeEquipoId} fetcher={fetchTipos} placeholder="Selecciona tipo de equipo" preloadItems={dbTypes} />'
);

replaceBlock(
  '<Select value={marcaId}',
  '</Select>',
  '<AsyncCombobox value={marcaId} onValueChange={(val) => { setMarcaId(val); setModeloId(""); }} fetcher={fetchMarcas} placeholder="Selecciona marca" preloadItems={dbBrands} />'
);

replaceBlock(
  '<Select value={modeloId}',
  '</Select>',
  '<AsyncCombobox value={modeloId} onValueChange={setModeloId} disabled={!marcaId} fetcher={fetchModelos} labelKey="nombre" placeholder={marcaId ? "Selecciona modelo" : "Selecciona marca primero"} preloadItems={dbModels} />'
);

replaceBlock(
  '<Select value={clienteId}',
  '</Select>',
  '<AsyncCombobox value={clienteId} onValueChange={setClienteId} fetcher={fetchClientes} placeholder="Selecciona cliente (Opcional)" preloadItems={[{id: "_null", nombre: "Sin Cliente (Ninguno)"}, ...dbClientes]} />'
);

replaceBlock(
  '<Select value={keyWinId}',
  '</Select>',
  '<AsyncCombobox value={keyWinId} onValueChange={setKeyWinId} fetcher={fetchWinLic} placeholder="Selecciona licencia Windows" preloadItems={[{id: "_null", version: "Sin Licencia Windows", key: ""}, {id: "clie", version: "Licencia Cliente", key: ""}, ...filteredWinLicenses]} renderItem={(item) => `${item.version} ${item.key ? "- " + item.key : ""} ${item.activa === false ? "(Inactiva)" : ""}`} renderValue={(item) => `${item.version} ${item.key ? "- " + item.key : ""}`} />'
);

replaceBlock(
  '<Select value={keyOfficeId}',
  '</Select>',
  '<AsyncCombobox value={keyOfficeId} onValueChange={setKeyOfficeId} fetcher={fetchOfficeLic} placeholder="Selecciona licencia Office" preloadItems={[{id: "_null", version: "Sin Licencia Office", key: ""}, {id: "marca", version: "Licencia de Marca", key: ""}, ...filteredOfficeLicenses]} renderItem={(item) => `${item.version} ${item.key ? "- " + item.key : ""} ${item.activa === false ? "(Inactiva)" : ""}`} renderValue={(item) => `${item.version} ${item.key ? "- " + item.key : ""}`} />'
);

replaceBlock(
  '<Select value={procesadorId}',
  '</Select>',
  '<AsyncCombobox value={procesadorId} onValueChange={setProcesadorId} fetcher={fetchCpu} placeholder="Selecciona un procesador" preloadItems={filteredCpus} renderItem={(c) => (<div className="flex flex-col"><span>{c.marca?.nombre || c.marca} {c.familia} {c.modelo}</span><span className="text-xs text-muted-foreground">{c.nucleos} Cores / {c.hilos} Threads - {c.frecuencia} - Stock: {c.uso}</span></div>)} renderValue={(c) => `${c.marca?.nombre || c.marca} ${c.familia} ${c.modelo}`} />'
);

replaceBlock(
  '<Select value={placaId}',
  '</Select>',
  '<AsyncCombobox value={placaId} onValueChange={setPlacaId} fetcher={fetchPlaca} placeholder="Selecciona una placa madre" preloadItems={filteredPlates} renderItem={(p) => (<div className="flex flex-col"><span>{p.marca?.nombre || p.marca} {p.modelo}</span><span className="text-xs text-muted-foreground">Socket: {p.socket} - Chipset: {p.chipset} - Stock: {p.uso}</span></div>)} renderValue={(p) => `${p.marca?.nombre || p.marca} ${p.modelo}`} />'
);

replaceBlock(
  '<Select value={fuenteId}',
  '</Select>',
  '<AsyncCombobox value={fuenteId} onValueChange={setFuenteId} fetcher={fetchFuente} placeholder="Selecciona una fuente de poder" preloadItems={filteredPowers} renderItem={(p) => (<div className="flex flex-col"><span>{p.marca?.nombre || p.marca} {p.modelo}</span><span className="text-xs text-muted-foreground">{p.potencia} - {p.certificacion} - Stock: {p.uso}</span></div>)} renderValue={(p) => `${p.marca?.nombre || p.marca} ${p.modelo}`} />'
);

replaceBlock(
  '<Select value={tarjetaGraficaId}',
  '</Select>',
  '<AsyncCombobox value={tarjetaGraficaId} onValueChange={setTarjetaGraficaId} fetcher={fetchGpu} placeholder="Selecciona una tarjeta gráfica (Opcional)" preloadItems={[{id: "_null", marca: "Sin Tarjeta Gráfica", modelo: ""}, ...filteredGpus]} renderItem={(g) => g.id === "_null" ? "Sin Tarjeta Gráfica" : (<div className="flex flex-col"><span>{g.marca?.nombre || g.marca} {g.modelo}</span><span className="text-xs text-muted-foreground">VRAM: {g.vram} - Stock: {g.uso}</span></div>)} renderValue={(g) => g.id === "_null" ? "Sin Tarjeta Gráfica" : `${g.marca?.nombre || g.marca} ${g.modelo}`} />'
);

fs.writeFileSync('components/forms/equipment-form-dialog-new.tsx', code);
console.log('Finished block replacements.');
