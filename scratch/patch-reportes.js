const fs = require('fs');

let pageContent = fs.readFileSync('app/dashboard/reportes/page.tsx', 'utf8');

// Add imports
if (!pageContent.includes('getClientes')) {
  pageContent = pageContent.replace(
    'import { getMantenciones } from "@/services/mantencionService"',
    'import { getMantenciones } from "@/services/mantencionService"\nimport { getClientes } from "@/services/clienteService"\nimport { downloadReport } from "@/services/reportesService"\nimport { useEffect } from "react"'
  );
}

// Add state for clientes
if (!pageContent.includes('const [clientes, setClientes]')) {
  pageContent = pageContent.replace(
    'const [generatingFormat, setGeneratingFormat] = useState<"pdf" | "excel" | "print" | null>(null)',
    'const [generatingFormat, setGeneratingFormat] = useState<"pdf" | "excel" | "print" | null>(null)\n  const [clientes, setClientes] = useState<any[]>([])\n  const [selectedCliente, setSelectedCliente] = useState<string>("all")\n\n  useEffect(() => {\n    getClientes(1, 1000).then(res => setClientes(res.data || [])).catch(console.error)\n  }, [])\n'
  );
}

// Add new UI section
const newSection = `
      {/* Backend PDF Reports */}
      <Card className="bg-card border-border shadow-sm mt-8">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
            <div className="flex flex-col gap-1.5 w-full sm:w-[300px]">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtrar por Cliente</label>
              <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                <SelectTrigger className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={() => downloadReport('computadores', selectedCliente)} className="w-full flex gap-2"><FileText className="w-4 h-4" /> Computadores</Button>
            <Button onClick={() => downloadReport('equipos', selectedCliente)} className="w-full flex gap-2"><FileText className="w-4 h-4" /> Equipos</Button>
            <Button onClick={() => downloadReport('todo', selectedCliente)} className="w-full flex gap-2"><FileText className="w-4 h-4" /> Inventario Completo</Button>
            <Button onClick={() => downloadReport('mantenciones', selectedCliente)} className="w-full flex gap-2"><FileText className="w-4 h-4" /> Mantenciones</Button>
          </div>
        </CardContent>
      </Card>
`;

if (!pageContent.includes('Reportes Oficiales (PDF Servidor)')) {
  pageContent = pageContent.replace(
    '      </div>\n    </div>\n  )\n}\n',
    '      </div>\n' + newSection + '    </div>\n  )\n}\n'
  );
}

fs.writeFileSync('app/dashboard/reportes/page.tsx', pageContent);
console.log('Patched page.tsx');
