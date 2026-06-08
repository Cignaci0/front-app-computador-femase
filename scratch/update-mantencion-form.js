const fs = require('fs');
let code = fs.readFileSync('components/forms/mantencion-form-dialog.tsx', 'utf8');

// Add Switch import
if (!code.includes('Switch } from "@/components/ui/switch"')) {
  code = code.replace(
    'import { Textarea } from "@/components/ui/textarea"',
    'import { Textarea } from "@/components/ui/textarea"\nimport { Switch } from "@/components/ui/switch"'
  );
}

// Add state
if (!code.includes('const [upgrade, setUpgrade] = useState(false)')) {
  code = code.replace(
    'const [descripcion, setDescripcion] = useState("")',
    'const [descripcion, setDescripcion] = useState("")\n  const [upgrade, setUpgrade] = useState(false)'
  );
}

// Edit mantencionToEdit assignment
if (!code.includes('setUpgrade(mantencionToEdit.upgrade || false)')) {
  code = code.replace(
    'setDescripcion(mantencionToEdit.descripcion || "")',
    'setDescripcion(mantencionToEdit.descripcion || "")\n        setUpgrade(mantencionToEdit.upgrade || false)'
  );
  code = code.replace(
    'setDescripcion("")',
    'setDescripcion("")\n        setUpgrade(false)'
  );
}

// Submit payload
if (!code.includes('upgrade,')) {
  code = code.replace(
    'descripcion,',
    'descripcion,\n      upgrade,'
  );
}

// Add Switch field
const switchField = `
            {/* Upgrade Switch */}
            <div className="space-y-2 md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/20">
              <div className="space-y-0.5">
                <Label htmlFor="m-upgrade">¿Es un Upgrade?</Label>
                <div className="text-[13px] text-muted-foreground">
                  Marcar si esta mantención incluye un upgrade de hardware.
                </div>
              </div>
              <Switch
                id="m-upgrade"
                checked={upgrade}
                onCheckedChange={setUpgrade}
              />
            </div>

            {/* Descripción */}
`;
if (!code.includes('¿Es un Upgrade?')) {
  code = code.replace('{/* Descripción */}', switchField);
}

fs.writeFileSync('components/forms/mantencion-form-dialog.tsx', code);
console.log('Updated mantencion-form-dialog.tsx');
