const fs = require('fs');

let code = fs.readFileSync('components/forms/equipment-form-dialog-new.tsx', 'utf8');

const regexMap = [
  {
    find: /<Select value=\{tipoDeEquipoId\} onValueChange=\{setTipoDeEquipoId\}>\s*<SelectTrigger id="eq-type" className="bg-secondary\/50 border-0">\s*<SelectValue placeholder="Selecciona tipo de equipo" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*\{dbTypes\.map\(\(t\) => \(\s*<SelectItem key=\{t\.id\} value=\{String\(t\.id\)\}>\s*\{t\.nombre\}\s*<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={tipoDeEquipoId} onValueChange={setTipoDeEquipoId} fetcher={fetchTipos} placeholder="Selecciona tipo de equipo" preloadItems={dbTypes} />`
  },
  {
    find: /<Select value=\{marcaId\} onValueChange=\{\(val\) => \{\s*setMarcaId\(val\)\s*setModeloId\(""\)\s*\}\}>\s*<SelectTrigger id="eq-brand" className="bg-secondary\/50 border-0">\s*<SelectValue placeholder="Selecciona marca" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*\{dbBrands\.map\(\(b\) => \(\s*<SelectItem key=\{b\.id\} value=\{String\(b\.id\)\}>\s*\{b\.nombre\}\s*<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={marcaId} onValueChange={(val) => { setMarcaId(val); setModeloId(""); }} fetcher={fetchMarcas} placeholder="Selecciona marca" preloadItems={dbBrands} />`
  },
  {
    find: /<Select value=\{modeloId\} onValueChange=\{setModeloId\} disabled=\{!marcaId\}>\s*<SelectTrigger id="eq-model" className="bg-secondary\/50 border-0">\s*<SelectValue placeholder=\{marcaId \? "Selecciona modelo" : "Selecciona marca primero"\} \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*\{filteredModels\.map\(\(m\) => \(\s*<SelectItem key=\{m\.id\} value=\{String\(m\.id\)\}>\s*\{m\.name\}\s*<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={modeloId} onValueChange={setModeloId} disabled={!marcaId} fetcher={fetchModelos} labelKey="nombre" placeholder={marcaId ? "Selecciona modelo" : "Selecciona marca primero"} preloadItems={dbModels} />`
  },
  {
    find: /<Select value=\{clienteId\} onValueChange=\{setClienteId\}>\s*<SelectTrigger id="eq-cliente" className="bg-secondary\/50 border-0">\s*<SelectValue placeholder="Selecciona cliente \(Opcional\)" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*<SelectItem value="_null">Sin Cliente \(Ninguno\)<\/SelectItem>\s*\{dbClientes\.map\(\(c\) => \(\s*<SelectItem key=\{c\.id\} value=\{String\(c\.id\)\}>\s*\{c\.nombre\}\s*<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={clienteId} onValueChange={setClienteId} fetcher={fetchClientes} placeholder="Selecciona cliente" preloadItems={[{id: "_null", nombre: "Sin Cliente (Ninguno)"}, ...dbClientes]} />`
  },
  {
    find: /<Select value=\{keyWinId\} onValueChange=\{setKeyWinId\}>\s*<SelectTrigger id="eq-keywin" className="bg-secondary\/50 border-0">\s*<SelectValue placeholder="Selecciona licencia Windows" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*<SelectItem value="_null">Sin Licencia Windows<\/SelectItem>\s*<SelectItem value="clie">Licencia Cliente<\/SelectItem>\s*\{filteredWinLicenses\.map\(\(l\) => \(\s*<SelectItem key=\{l\.id\} value=\{String\(l\.id\)\}>\s*\{l\.version\} - \{l\.key\} \{!l\.activa \? "\(Inactiva\)" : ""\}\s*<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={keyWinId} onValueChange={setKeyWinId} fetcher={fetchWinLic} placeholder="Selecciona licencia Windows" preloadItems={[{id: "_null", version: "Sin Licencia Windows", key: ""}, {id: "clie", version: "Licencia Cliente", key: ""}, ...filteredWinLicenses]} renderItem={(item) => \`\${item.version} \${item.key ? "- " + item.key : ""} \${item.activa === false ? "(Inactiva)" : ""}\`} renderValue={(item) => \`\${item.version} \${item.key ? "- " + item.key : ""}\`} />`
  },
  {
    find: /<Select value=\{keyOfficeId\} onValueChange=\{setKeyOfficeId\}>\s*<SelectTrigger id="eq-keyoffice" className="bg-secondary\/50 border-0">\s*<SelectValue placeholder="Selecciona licencia Office" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*<SelectItem value="_null">Sin Licencia Office<\/SelectItem>\s*<SelectItem value="marca">Licencia de Marca<\/SelectItem>\s*\{filteredOfficeLicenses\.map\(\(l\) => \(\s*<SelectItem key=\{l\.id\} value=\{String\(l\.id\)\}>\s*\{l\.version\} - \{l\.key\} \{!l\.activa \? "\(Inactiva\)" : ""\}\s*<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={keyOfficeId} onValueChange={setKeyOfficeId} fetcher={fetchOfficeLic} placeholder="Selecciona licencia Office" preloadItems={[{id: "_null", version: "Sin Licencia Office", key: ""}, {id: "marca", version: "Licencia de Marca", key: ""}, ...filteredOfficeLicenses]} renderItem={(item) => \`\${item.version} \${item.key ? "- " + item.key : ""} \${item.activa === false ? "(Inactiva)" : ""}\`} renderValue={(item) => \`\${item.version} \${item.key ? "- " + item.key : ""}\`} />`
  },
  {
    find: /<Select value=\{procesadorId\} onValueChange=\{setProcesadorId\}>\s*<SelectTrigger id="hw-cpu" className="bg-secondary\/50 border-0 h-auto min-h-10">\s*<SelectValue placeholder="Selecciona un procesador" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*\{filteredCpus\.map\(\(c\) => \(\s*<SelectItem key=\{c\.id\} value=\{String\(c\.id\)\}>\s*<div className="flex flex-col">\s*<span>\{c\.marca\} \{c\.familia\} \{c\.modelo\}<\/span>\s*<span className="text-xs text-muted-foreground">\s*\{c\.nucleos\} Cores \/ \{c\.hilos\} Threads - \{c\.frecuencia\} - Stock: \{c\.uso\}\s*<\/span>\s*<\/div>\s*<\/SelectItem>\s*\)\)\}\s*\{filteredCpus\.length === 0 && \(\s*<SelectItem value="_empty" disabled>No hay procesadores disponibles<\/SelectItem>\s*\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={procesadorId} onValueChange={setProcesadorId} fetcher={fetchCpu} placeholder="Selecciona un procesador" preloadItems={filteredCpus} renderItem={(c) => (<div className="flex flex-col"><span>{c.marca?.nombre || c.marca} {c.familia} {c.modelo}</span><span className="text-xs text-muted-foreground">{c.nucleos} Cores / {c.hilos} Threads - {c.frecuencia} - Stock: {c.uso}</span></div>)} renderValue={(c) => \`\${c.marca?.nombre || c.marca} \${c.familia} \${c.modelo}\`} />`
  },
  {
    find: /<Select value=\{placaId\} onValueChange=\{setPlacaId\}>\s*<SelectTrigger id="hw-placa" className="bg-secondary\/50 border-0 h-auto min-h-10">\s*<SelectValue placeholder="Selecciona una placa madre" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*\{filteredPlates\.map\(\(p\) => \(\s*<SelectItem key=\{p\.id\} value=\{String\(p\.id\)\}>\s*<div className="flex flex-col">\s*<span>\{p\.marca\} \{p\.modelo\}<\/span>\s*<span className="text-xs text-muted-foreground">\s*Socket: \{p\.socket\} - Chipset: \{p\.chipset\} - Stock: \{p\.uso\}\s*<\/span>\s*<\/div>\s*<\/SelectItem>\s*\)\)\}\s*\{filteredPlates\.length === 0 && \(\s*<SelectItem value="_empty" disabled>No hay placas disponibles<\/SelectItem>\s*\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={placaId} onValueChange={setPlacaId} fetcher={fetchPlaca} placeholder="Selecciona una placa madre" preloadItems={filteredPlates} renderItem={(p) => (<div className="flex flex-col"><span>{p.marca?.nombre || p.marca} {p.modelo}</span><span className="text-xs text-muted-foreground">Socket: {p.socket} - Chipset: {p.chipset} - Stock: {p.uso}</span></div>)} renderValue={(p) => \`\${p.marca?.nombre || p.marca} \${p.modelo}\`} />`
  },
  {
    find: /<Select value=\{fuenteId\} onValueChange=\{setFuenteId\}>\s*<SelectTrigger id="hw-fuente" className="bg-secondary\/50 border-0 h-auto min-h-10">\s*<SelectValue placeholder="Selecciona una fuente de poder" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*\{filteredPowers\.map\(\(p\) => \(\s*<SelectItem key=\{p\.id\} value=\{String\(p\.id\)\}>\s*<div className="flex flex-col">\s*<span>\{p\.marca\} \{p\.modelo\}<\/span>\s*<span className="text-xs text-muted-foreground">\s*\{p\.potencia\} - \{p\.certificacion\} - Stock: \{p\.uso\}\s*<\/span>\s*<\/div>\s*<\/SelectItem>\s*\)\)\}\s*\{filteredPowers\.length === 0 && \(\s*<SelectItem value="_empty" disabled>No hay fuentes disponibles<\/SelectItem>\s*\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={fuenteId} onValueChange={setFuenteId} fetcher={fetchFuente} placeholder="Selecciona una fuente de poder" preloadItems={filteredPowers} renderItem={(p) => (<div className="flex flex-col"><span>{p.marca?.nombre || p.marca} {p.modelo}</span><span className="text-xs text-muted-foreground">{p.potencia} - {p.certificacion} - Stock: {p.uso}</span></div>)} renderValue={(p) => \`\${p.marca?.nombre || p.marca} \${p.modelo}\`} />`
  },
  {
    find: /<Select value=\{tarjetaGraficaId\} onValueChange=\{setTarjetaGraficaId\}>\s*<SelectTrigger id="hw-gpu" className="bg-secondary\/50 border-0 h-auto min-h-10">\s*<SelectValue placeholder="Selecciona una tarjeta gráfica \(Opcional\)" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*<SelectItem value="_null">Sin Tarjeta Gráfica<\/SelectItem>\s*\{filteredGpus\.map\(\(g\) => \(\s*<SelectItem key=\{g\.id\} value=\{String\(g\.id\)\}>\s*<div className="flex flex-col">\s*<span>\{g\.marca\} \{g\.modelo\}<\/span>\s*<span className="text-xs text-muted-foreground">\s*VRAM: \{g\.vram\} - Stock: \{g\.uso\}\s*<\/span>\s*<\/div>\s*<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/g,
    repl: `<AsyncCombobox value={tarjetaGraficaId} onValueChange={setTarjetaGraficaId} fetcher={fetchGpu} placeholder="Selecciona una tarjeta gráfica" preloadItems={[{id: "_null", marca: "Sin Tarjeta Gráfica", modelo: ""}, ...filteredGpus]} renderItem={(g) => g.id === "_null" ? "Sin Tarjeta Gráfica" : (<div className="flex flex-col"><span>{g.marca?.nombre || g.marca} {g.modelo}</span><span className="text-xs text-muted-foreground">VRAM: {g.vram} - Stock: {g.uso}</span></div>)} renderValue={(g) => g.id === "_null" ? "Sin Tarjeta Gráfica" : \`\${g.marca?.nombre || g.marca} \${g.modelo}\`} />`
  }
];

let i = 0;
for (const rule of regexMap) {
  i++;
  let oldLen = code.length;
  code = code.replace(rule.find, rule.repl);
  if (oldLen === code.length) {
     console.log('Missed rule:', i);
  }
}

fs.writeFileSync('components/forms/equipment-form-dialog-new.tsx', code);
console.log('Finished main replacements.');
