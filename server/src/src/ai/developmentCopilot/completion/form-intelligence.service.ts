type FieldInput = {
  name: string;
  type?: string;
  required?: boolean;
  label?: string;
};

function inputType(field: FieldInput): string {
  const value = String(field.type ?? "string").toLowerCase();
  if (value.includes("date")) return "date";
  if (value.includes("int") || value.includes("float") || value.includes("decimal")) return "number";
  if (value.includes("bool")) return "checkbox";
  if (value.includes("email")) return "email";
  return "text";
}

export function buildIntelligentForm(input: {
  name?: string;
  fields?: FieldInput[];
}) {
  const name = String(input.name ?? "GeneratedForm").replace(/[^A-Za-z0-9_]/g, "");
  const fields = Array.isArray(input.fields) ? input.fields : [];

  const normalized = fields.map((field) => ({
    name: field.name,
    label: field.label ?? field.name.replace(/([A-Z])/g, " $1").trim(),
    inputType: inputType(field),
    required: Boolean(field.required),
    validation: {
      required: Boolean(field.required),
      minLength: inputType(field) === "text" ? 2 : undefined,
    },
  }));

  return {
    name,
    fields: normalized,
    accessibility: {
      labelsRequired: true,
      errorSummary: true,
      keyboardNavigation: true,
    },
    crud: {
      create: true,
      read: true,
      update: true,
      delete: false,
    },
  };
}
