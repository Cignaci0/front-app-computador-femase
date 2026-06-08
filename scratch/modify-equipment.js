const fs = require('fs');

let code = fs.readFileSync('components/forms/equipment-form-dialog.tsx', 'utf8');

// Add import
code = code.replace('import { Switch } from "@/components/ui/switch"', 'import { Switch } from "@/components/ui/switch"\nimport { AsyncCombobox } from "@/components/ui/async-combobox"\nimport { useCallback } from "react"');

// Add useCallback fetchers
const fetchers = `
  const fetchMarcas = useCallback((s) => getMarcas(1, 10, s).then(r => r.data || []), [])
  const fetchModelos = useCallback((s) => getModelos(1, 10, s, marcaId ? Number(marcaId) : undefined).then(r => (r.data || []).map(m => ({ id: m.id, nombre: m.name || m.nombre, brandId: m.marca?.id }))), [marcaId])
  const fetchTipos = useCallback((s) => getTiposDeEquipo(1, 10, s).then(r => r.data || []), [])
  const fetchClientes = useCallback((s) => getClientes(1, 10, s).then(r => r.data || []), [])
  
  const fetchWinLic = useCallback((s) => getLicenciasWin(1, 10, s).then(r => r.data || []), [])
  const fetchOfficeLic = useCallback((s) => getLicenciasOffice(1, 10, s).then(r => r.data || []), [])

  const fetchCpu = useCallback((s) => getComponentes('procesador', 1, 10, s).then(r => r.data || []), [])
  const fetchPlaca = useCallback((s) => getComponentes('placa-madre', 1, 10, s).then(r => r.data || []), [])
  const fetchGpu = useCallback((s) => getComponentes('tarjeta-grafica', 1, 10, s).then(r => r.data || []), [])
  const fetchFuente = useCallback((s) => getComponentes('fuente-poder', 1, 10, s).then(r => r.data || []), [])
  
  const fetchRam = useCallback((s) => getComponentes('memoria-ram', 1, 10, s).then(r => r.data || []), [])
  const fetchDisk = useCallback((s) => getComponentes('disco-almacenamiento', 1, 10, s).then(r => r.data || []), [])
`;

code = code.replace('const [activeTab, setActiveTab] = useState("general")', fetchers + '\n  const [activeTab, setActiveTab] = useState("general")');

fs.writeFileSync('components/forms/equipment-form-dialog-new.tsx', code);
console.log('Done script 1');
