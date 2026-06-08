const fs = require('fs');
let code = fs.readFileSync('components/forms/component-form-dialog.tsx', 'utf8');

if (!code.includes('import { AsyncCombobox }')) {
  code = code.replace('import { useState, useEffect } from "react"', 'import { useState, useEffect, useCallback } from "react"');
  code = code.replace('import { cn } from "@/lib/utils"', 'import { cn } from "@/lib/utils"\nimport { AsyncCombobox } from "@/components/ui/async-combobox"');
}

if (!code.includes('const fetchMarcas = useCallback')) {
  code = code.replace('const [searchBrand, setSearchBrand] = useState("")', 'const [searchBrand, setSearchBrand] = useState("")\n  const fetchMarcas = useCallback((s: string) => getMarcas(1, 10, s).then(r => r.data || []), [])');
}

code = code.replace('onValueChange={(val) => handleFieldChange(field.key, val)}', 'onValueChange={(val: string) => handleFieldChange(field.key, val)}');

fs.writeFileSync('components/forms/component-form-dialog.tsx', code);
console.log('Fixed imports');
