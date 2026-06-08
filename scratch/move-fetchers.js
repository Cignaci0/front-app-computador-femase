const fs = require('fs');
let code = fs.readFileSync('components/forms/equipment-form-dialog.tsx', 'utf8');
const fetchersRegex = /const fetchMarcas = useCallback[\s\S]*?const fetchDisk = useCallback\(\(s: string\) => getComponentes\('disco-almacenamiento', 1, 10, s\)\.then\(r => r\.data \|\| \[\]\), \[\]\)/;
const match = code.match(fetchersRegex);
if (match) {
  code = code.replace(match[0], '');
  const insertAfter = 'const [mDisco3, setMDisco3] = useState({ id: "", marca: "", tipo_disco: "", modelo: "", capacidad: "" })';
  code = code.replace(insertAfter, insertAfter + '\n\n  ' + match[0]);
  fs.writeFileSync('components/forms/equipment-form-dialog.tsx', code);
  console.log('Moved fetchers');
} else {
  console.log('Could not match fetchers');
}
