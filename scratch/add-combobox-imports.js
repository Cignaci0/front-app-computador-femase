const fs = require('fs');
let code = fs.readFileSync('components/forms/component-form-dialog.tsx', 'utf8');

if (!code.includes('import { AsyncCombobox }')) {
  code = code.replace('import { Check, ChevronsUpDown } from "lucide-react"', 'import { Check, ChevronsUpDown } from "lucide-react"\nimport { AsyncCombobox } from "@/components/ui/async-combobox"\nimport { useCallback } from "react"');
}

if (!code.includes('const fetchMarcas = useCallback')) {
  code = code.replace('const [searchBrand, setSearchBrand] = useState("")', 'const [searchBrand, setSearchBrand] = useState("")\n  const fetchMarcas = useCallback((s: string) => getMarcas(1, 10, s).then(r => r.data || []), [])');
}

fs.writeFileSync('components/forms/component-form-dialog.tsx', code);
console.log('Added imports and fetcher');
