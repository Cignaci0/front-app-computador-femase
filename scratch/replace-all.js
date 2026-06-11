const fs = require('fs');
let code = fs.readFileSync('components/forms/equipment-form-dialog-new.tsx', 'utf8');

const replacements = [
  {
    regex: /<Select value=\{tipoDeEquipoId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={tipoDeEquipoId} onValueChange={setTipoDeEquipoId} fetcher={fetchTipos} placeholder="Selecciona tipo de equipo" preloadItems={dbTypes} filterItem={t => t.computador || String(t.id) === tipoDeEquipoId} />`
  },
  {
    regex: /<Select value=\{marcaId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={marcaId} onValueChange={(val) => { setMarcaId(val); setModeloId(""); }} fetcher={fetchMarcas} placeholder="Selecciona marca" preloadItems={dbBrands} />`
  },
  {
    regex: /<Select value=\{modeloId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={modeloId} onValueChange={setModeloId} disabled={!marcaId} fetcher={fetchModelos} labelKey="nombre" placeholder={marcaId ? "Selecciona modelo" : "Selecciona marca primero"} preloadItems={dbModels} />`
  },
  {
    regex: /<Select value=\{clienteId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={clienteId} onValueChange={setClienteId} fetcher={fetchClientes} placeholder="Selecciona cliente" preloadItems={[{id: "_null", nombre: "Sin Cliente (Ninguno)"}, ...dbClientes]} />`
  },
  {
    regex: /<Select value=\{keyWinId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={keyWinId} onValueChange={setKeyWinId} fetcher={fetchWinLic} placeholder="Selecciona licencia Windows" preloadItems={[{id: "_null", version: "Sin Licencia Windows", key: ""}, {id: "clie", version: "Licencia de marca", key: ""}, ...filteredWinLicenses]} renderItem={(item) => \`\${item.version} \${item.key ? "- " + item.key : ""} \${item.activa === false ? "(Inactiva)" : ""}\`} renderValue={(item) => \`\${item.version} \${item.key ? "- " + item.key : ""}\`} />`
  },
  {
    regex: /<Select value=\{keyOfficeId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={keyOfficeId} onValueChange={setKeyOfficeId} fetcher={fetchOfficeLic} placeholder="Selecciona licencia Office" preloadItems={[{id: "_null", version: "Sin Licencia Office", key: ""}, {id: "marca", version: "Cliente ya posee una", key: ""}, ...filteredOfficeLicenses]} renderItem={(item) => \`\${item.version} \${item.key ? "- " + item.key : ""} \${item.activa === false ? "(Inactiva)" : ""}\`} renderValue={(item) => \`\${item.version} \${item.key ? "- " + item.key : ""}\`} />`
  },
  {
    regex: /<Select value=\{procesadorId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={procesadorId} onValueChange={setProcesadorId} fetcher={fetchCpu} placeholder="Selecciona un procesador" preloadItems={filteredCpus} renderItem={(c) => (<div className="flex flex-col"><span>{c.marca?.nombre || c.marca} {c.familia} {c.modelo}</span><span className="text-xs text-muted-foreground">{c.nucleos} Cores / {c.hilos} Threads - {c.frecuencia} - Stock: {c.uso}</span></div>)} renderValue={(c) => \`\${c.marca?.nombre || c.marca} \${c.familia} \${c.modelo}\`} />`
  },
  {
    regex: /<Select value=\{placaId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={placaId} onValueChange={setPlacaId} fetcher={fetchPlaca} placeholder="Selecciona una placa madre" preloadItems={filteredPlates} renderItem={(p) => (<div className="flex flex-col"><span>{p.marca?.nombre || p.marca} {p.modelo}</span><span className="text-xs text-muted-foreground">Socket: {p.socket} - Chipset: {p.chipset} - Stock: {p.uso}</span></div>)} renderValue={(p) => \`\${p.marca?.nombre || p.marca} \${p.modelo}\`} />`
  },
  {
    regex: /<Select value=\{fuenteId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={fuenteId} onValueChange={setFuenteId} fetcher={fetchFuente} placeholder="Selecciona una fuente de poder" preloadItems={filteredPowers} renderItem={(p) => (<div className="flex flex-col"><span>{p.marca?.nombre || p.marca} {p.modelo}</span><span className="text-xs text-muted-foreground">{p.potencia} - {p.certificacion} - Stock: {p.uso}</span></div>)} renderValue={(p) => \`\${p.marca?.nombre || p.marca} \${p.modelo}\`} />`
  },
  {
    regex: /<Select value=\{tarjetaGraficaId\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={tarjetaGraficaId} onValueChange={setTarjetaGraficaId} fetcher={fetchGpu} placeholder="Selecciona una tarjeta gráfica" preloadItems={[{id: "_null", marca: "Sin Tarjeta Gráfica", modelo: ""}, ...filteredGpus]} renderItem={(g) => g.id === "_null" ? "Sin Tarjeta Gráfica" : (<div className="flex flex-col"><span>{g.marca?.nombre || g.marca} {g.modelo}</span><span className="text-xs text-muted-foreground">VRAM: {g.vram} - Stock: {g.uso}</span></div>)} renderValue={(g) => g.id === "_null" ? "Sin Tarjeta Gráfica" : \`\${g.marca?.nombre || g.marca} \${g.modelo}\`} />`
  },
  {
    regex: /<Select value=\{memoriaRam1Id\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={memoriaRam1Id} onValueChange={setMemoriaRam1Id} fetcher={fetchRam} placeholder="Selecciona RAM para slot 1" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...rams]} filterItem={(r) => r.id === "_null" || getCalculatedRamStockForSlot(r, 1) > 0 || String(r.id) === memoriaRam1Id} renderItem={(r) => r.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{r.marca?.nombre || r.marca} {r.tipo_tecnologia} {r.capacidad} {r.frecuencia}</span><span className="text-xs text-muted-foreground">{r.formato} - Stock disp: {getCalculatedRamStockForSlot(r, 1)}</span></div>)} renderValue={(r) => r.id === "_null" ? "Ninguno" : \`\${r.marca?.nombre || r.marca} \${r.capacidad} \${r.frecuencia}\`} />`
  },
  {
    regex: /<Select value=\{memoriaRam2Id\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={memoriaRam2Id} onValueChange={setMemoriaRam2Id} fetcher={fetchRam} placeholder="Selecciona RAM para slot 2" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...rams]} filterItem={(r) => r.id === "_null" || getCalculatedRamStockForSlot(r, 2) > 0 || String(r.id) === memoriaRam2Id} renderItem={(r) => r.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{r.marca?.nombre || r.marca} {r.tipo_tecnologia} {r.capacidad} {r.frecuencia}</span><span className="text-xs text-muted-foreground">{r.formato} - Stock disp: {getCalculatedRamStockForSlot(r, 2)}</span></div>)} renderValue={(r) => r.id === "_null" ? "Ninguno" : \`\${r.marca?.nombre || r.marca} \${r.capacidad} \${r.frecuencia}\`} />`
  },
  {
    regex: /<Select value=\{memoriaRam3Id\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={memoriaRam3Id} onValueChange={setMemoriaRam3Id} fetcher={fetchRam} placeholder="Selecciona RAM para slot 3" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...rams]} filterItem={(r) => r.id === "_null" || getCalculatedRamStockForSlot(r, 3) > 0 || String(r.id) === memoriaRam3Id} renderItem={(r) => r.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{r.marca?.nombre || r.marca} {r.tipo_tecnologia} {r.capacidad} {r.frecuencia}</span><span className="text-xs text-muted-foreground">{r.formato} - Stock disp: {getCalculatedRamStockForSlot(r, 3)}</span></div>)} renderValue={(r) => r.id === "_null" ? "Ninguno" : \`\${r.marca?.nombre || r.marca} \${r.capacidad} \${r.frecuencia}\`} />`
  },
  {
    regex: /<Select value=\{memoriaRam4Id\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={memoriaRam4Id} onValueChange={setMemoriaRam4Id} fetcher={fetchRam} placeholder="Selecciona RAM para slot 4" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...rams]} filterItem={(r) => r.id === "_null" || getCalculatedRamStockForSlot(r, 4) > 0 || String(r.id) === memoriaRam4Id} renderItem={(r) => r.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{r.marca?.nombre || r.marca} {r.tipo_tecnologia} {r.capacidad} {r.frecuencia}</span><span className="text-xs text-muted-foreground">{r.formato} - Stock disp: {getCalculatedRamStockForSlot(r, 4)}</span></div>)} renderValue={(r) => r.id === "_null" ? "Ninguno" : \`\${r.marca?.nombre || r.marca} \${r.capacidad} \${r.frecuencia}\`} />`
  },
  {
    regex: /<Select value=\{discoAlma1Id\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={discoAlma1Id} onValueChange={setDiscoAlma1Id} fetcher={fetchDisk} placeholder="Selecciona disco 1" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...disks]} filterItem={(d) => d.id === "_null" || getCalculatedDiskStockForSlot(d, 1) > 0 || String(d.id) === discoAlma1Id} renderItem={(d) => d.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{d.marca?.nombre || d.marca} {d.modelo}</span><span className="text-xs text-muted-foreground">{d.tipo_disco} {d.capacidad} - Stock: {getCalculatedDiskStockForSlot(d, 1)}</span></div>)} renderValue={(d) => d.id === "_null" ? "Ninguno" : \`\${d.marca?.nombre || d.marca} \${d.modelo}\`} />`
  },
  {
    regex: /<Select value=\{discoAlma2Id\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={discoAlma2Id} onValueChange={setDiscoAlma2Id} fetcher={fetchDisk} placeholder="Selecciona disco 2" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...disks]} filterItem={(d) => d.id === "_null" || getCalculatedDiskStockForSlot(d, 2) > 0 || String(d.id) === discoAlma2Id} renderItem={(d) => d.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{d.marca?.nombre || d.marca} {d.modelo}</span><span className="text-xs text-muted-foreground">{d.tipo_disco} {d.capacidad} - Stock: {getCalculatedDiskStockForSlot(d, 2)}</span></div>)} renderValue={(d) => d.id === "_null" ? "Ninguno" : \`\${d.marca?.nombre || d.marca} \${d.modelo}\`} />`
  },
  {
    regex: /<Select value=\{discoAlma3Id\}[\s\S]*?<\/Select>/,
    repl: `<AsyncCombobox value={discoAlma3Id} onValueChange={setDiscoAlma3Id} fetcher={fetchDisk} placeholder="Selecciona disco 3" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...disks]} filterItem={(d) => d.id === "_null" || getCalculatedDiskStockForSlot(d, 3) > 0 || String(d.id) === discoAlma3Id} renderItem={(d) => d.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{d.marca?.nombre || d.marca} {d.modelo}</span><span className="text-xs text-muted-foreground">{d.tipo_disco} {d.capacidad} - Stock: {getCalculatedDiskStockForSlot(d, 3)}</span></div>)} renderValue={(d) => d.id === "_null" ? "Ninguno" : \`\${d.marca?.nombre || d.marca} \${d.modelo}\`} />`
  }
];

// Let's use string operations to replace the FIRST occurrence of the matching pattern, to avoid regex greediness over multiple Selects
for (const rule of replacements) {
  const match = code.match(rule.regex);
  if (match) {
    code = code.replace(rule.regex, rule.repl);
    console.log("Replaced");
  } else {
    // If not found, maybe it has slightly different spacing. We can do a manual search.
    console.log("NOT FOUND: ", rule.regex);
  }
}

fs.writeFileSync('components/forms/equipment-form-dialog-new.tsx', code);
console.log('Finished regex block replacements.');
