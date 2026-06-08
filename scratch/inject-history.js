const fs = require('fs');
let code = fs.readFileSync('app/dashboard/mantenciones/page.tsx', 'utf8');

// 1. Add imports
if (!code.includes('import { MantencionHistoryDialog }')) {
  code = code.replace(
    'import { MantencionFormDialog } from "@/components/forms/mantencion-form-dialog"',
    'import { MantencionFormDialog } from "@/components/forms/mantencion-form-dialog"\nimport { MantencionHistoryDialog } from "@/components/dialogs/mantencion-history-dialog"\nimport { AsyncCombobox } from "@/components/ui/async-combobox"\nimport { getComputadores } from "@/services/computadorService"'
  );
  
  if (!code.includes('useCallback')) {
    code = code.replace('import { useState, useEffect } from "react"', 'import { useState, useEffect, useCallback } from "react"');
  }
}

// 2. Add state and fetcher
if (!code.includes('const [historyDialogOpen, setHistoryDialogOpen]')) {
  const stateInjection = `  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [historyComputadorId, setHistoryComputadorId] = useState<string | null>(null)
  
  const fetchComputadores = useCallback((search: string) => {
    return getComputadores(1, 15, search).then(res => res.data || [])
  }, [])
`;
  code = code.replace('const [page, setPage] = useState(1)', stateInjection + '\n  const [page, setPage] = useState(1)');
}

// 3. Inject combobox into UI
if (!code.includes('Historial de computador...')) {
  const headerOld = `<CardHeader className="pb-0">
          <CardTitle className="text-base font-medium">
            {isLoading ? "Cargando..." : \`\${data.length} mantenciones encontradas\`}
          </CardTitle>
        </CardHeader>`;
  const headerNew = `<CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">
            {isLoading ? "Cargando..." : \`\${data.length} mantenciones encontradas\`}
          </CardTitle>
          <div className="w-[300px]">
            <AsyncCombobox 
              value={historyComputadorId || ""} 
              onValueChange={(val) => {
                if (val) {
                  setHistoryComputadorId(val)
                  setHistoryDialogOpen(true)
                }
              }} 
              fetcher={fetchComputadores} 
              placeholder="Historial de computador..." 
              renderItem={(c) => \`\${c.nombre_equipo} \${c.usuario ? '(' + c.usuario + ')' : ''}\`} 
              renderValue={(c) => \`\${c.nombre_equipo} \${c.usuario ? '(' + c.usuario + ')' : ''}\`} 
              className="h-9" 
            />
          </div>
        </CardHeader>`;
  code = code.replace(headerOld, headerNew);
}

// 4. Inject Dialog at the end
if (!code.includes('<MantencionHistoryDialog')) {
  const dialogInjection = `      <MantencionHistoryDialog
        open={historyDialogOpen}
        onOpenChange={(open) => {
          setHistoryDialogOpen(open)
          if (!open) {
            setHistoryComputadorId(null) // clear selection when closing
          }
        }}
        computadorId={historyComputadorId}
      />
    </div>`;
  code = code.replace('    </div>', dialogInjection);
}

fs.writeFileSync('app/dashboard/mantenciones/page.tsx', code);
console.log('Injected history dialog and combobox');
