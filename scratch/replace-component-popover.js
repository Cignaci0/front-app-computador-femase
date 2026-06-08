const fs = require('fs');
let code = fs.readFileSync('components/forms/component-form-dialog.tsx', 'utf8');

const regex = /<Popover open=\{openComboboxBrand\} onOpenChange=\{setOpenComboboxBrand\}>[\s\S]*?<\/Popover>/;

const replacement = `<AsyncCombobox
                          value={String(formData[field.key] || "")}
                          onValueChange={(val) => handleFieldChange(field.key, val)}
                          fetcher={fetchMarcas}
                          placeholder={field.placeholder}
                          preloadItems={
                            formData[field.key] 
                              ? formData[field.key] === "_null" 
                                ? [{ id: "_null", nombre: "Sin Marca (Ninguno)" }] 
                                : brands.find(b => String(b.id) === String(formData[field.key])) 
                                  ? [{ id: formData[field.key], nombre: brands.find(b => String(b.id) === String(formData[field.key]))?.name }] 
                                  : [{ id: formData[field.key], nombre: "Marca actual" }]
                              : []
                          }
                          extraItems={type === "disco-almacenamiento" ? [{ id: "_null", nombre: "Sin Marca (Ninguno)" }] : []}
                        />`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('components/forms/component-form-dialog.tsx', code);
  console.log('Replaced Popover in component-form-dialog');
} else {
  console.log('Popover block not found');
}
