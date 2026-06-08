const fs = require('fs');
let code = fs.readFileSync('app/dashboard/computadores/page.tsx', 'utf8');

// Check if cn is imported
if (!code.includes('import { cn }')) {
  code = code.replace(
    'import { Button } from "@/components/ui/button"',
    'import { Button } from "@/components/ui/button"\nimport { cn } from "@/lib/utils"'
  );
}

// Replace TableRow
code = code.replace(
  '<TableRow key={item.id} className="border-border">',
  '<TableRow key={item.id} className={cn("border-border", item.upgrade && "bg-emerald-500/10 hover:bg-emerald-500/20")}>'
);

fs.writeFileSync('app/dashboard/computadores/page.tsx', code);
console.log('Updated computadores/page.tsx');
