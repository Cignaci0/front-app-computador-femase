const fs = require('fs');
let code = fs.readFileSync('components/ui/async-combobox.tsx', 'utf8');

if (!code.includes('className?: string;')) {
  code = code.replace('filterItem?: (item: any) => boolean;', 'filterItem?: (item: any) => boolean;\n  className?: string;');
  code = code.replace('export function AsyncCombobox({', 'export function AsyncCombobox({\n  className,');
  code = code.replace('className="w-full justify-between bg-secondary/50 border-0"', 'className={cn("w-full justify-between bg-secondary/50 border-0", className)}');
  fs.writeFileSync('components/ui/async-combobox.tsx', code);
  console.log('Added className');
} else {
  console.log('className already exists');
}
