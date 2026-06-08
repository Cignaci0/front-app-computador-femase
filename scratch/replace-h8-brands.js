const fs = require('fs');
let code = fs.readFileSync('components/forms/equipment-form-dialog.tsx', 'utf8');

const regex = /<Select\s+value=\{([a-zA-Z0-9_]+)\.marca\}\s+onValueChange=\{\(val\) => set([a-zA-Z0-9_]+)\(\{ \.\.\.[a-zA-Z0-9_]+, marca: val \}\)\}\s*>\s*<SelectTrigger className=\"bg-secondary\/50 border-0 h-8 text-xs\">\s*<SelectValue placeholder=\"Seleccionar\" \/>\s*<\/SelectTrigger>\s*<SelectContent>\s*\{dbBrands\.map\(\(b\) => \(\s*<SelectItem key=\{b\.id\} value=\{String\(b\.id\)\}>\s*\{b\.nombre\}\s*<\/SelectItem>\s*\)\)\}\s*<\/SelectContent>\s*<\/Select>/g;

let matches = code.match(regex);
console.log(`Found ${matches ? matches.length : 0} matches.`);

if (matches) {
  code = code.replace(regex, (match, stateVar, setterVar) => {
    return `<AsyncCombobox value={${stateVar}.marca} onValueChange={(val) => set${setterVar}({ ...${stateVar}, marca: val })} fetcher={fetchMarcas} placeholder="Seleccionar" preloadItems={dbBrands} className="h-8 text-xs" />`;
  });
  fs.writeFileSync('components/forms/equipment-form-dialog.tsx', code);
  console.log('Replaced all inner brand selects with h-8!');
}
