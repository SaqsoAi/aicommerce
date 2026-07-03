import { SaqsoButton, SaqsoCard } from "@/components/saqso";

type Field = {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  visible?: boolean;
  enabled?: boolean;
  sortOrder?: number;
};

export default function AccountSettings({
  profile,
  fields,
  saving,
  setProfile,
  saveProfile,
}: {
  profile: any;
  fields: Field[];
  saving: boolean;
  setProfile: any;
  saveProfile: () => void;
}) {
  return (
    <div id="account-settings">
      <SaqsoCard>
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              Account Settings
            </p>

            <h2 className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
              Profile & Preferences
            </h2>

            <p className="mt-1 text-zinc-500">
              {profile?.email}
            </p>
          </div>

          <SaqsoButton onClick={saveProfile}>
            {saving ? "Saving..." : "Save Profile"}
          </SaqsoButton>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => {
            const key = mapFieldName(field.name);

            return (
              <FieldRenderer
                key={field.id}
                field={field}
                value={profile?.[key] || ""}
                onChange={(value) =>
                  setProfile((prev: any) => ({
                    ...prev,
                    [key]: value,
                  }))
                }
              />
            );
          })}
        </div>
      </SaqsoCard>
    </div>
  );
}

function mapFieldName(name: string) {
  const map: Record<string, string> = {
    profilePhoto: "avatar",
    facebook: "facebookUrl",
    instagram: "instagramUrl",
    linkedin: "linkedinUrl",
    youtube: "youtubeUrl",
    tiktok: "tiktokUrl",
    website: "websiteUrl",
  };

  return map[name] || name;
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}) {
  const baseClass =
    "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";

  if (field.type === "SELECT") {
    const options =
      field.name === "gender"
        ? ["", "Male", "Female", "Other"]
        : field.name === "themeMode"
        ? ["SYSTEM", "LIGHT", "DARK"]
        : field.name === "preferredCurrency"
        ? ["BDT", "USD", "EUR"]
        : field.name === "preferredLanguage"
        ? ["en", "bn"]
        : [""];

    return (
      <label>
        <Label field={field} />
        <select value={value} required={field.required} onChange={(e) => onChange(e.target.value)} className={baseClass}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option || "Select"}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "TEXTAREA") {
    return (
      <label className="md:col-span-2">
        <Label field={field} />
        <textarea
          value={value}
          required={field.required}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClass} h-32`}
        />
      </label>
    );
  }

  return (
    <label>
      <Label field={field} />
      <input
        value={value}
        required={field.required}
        placeholder={field.placeholder}
        type={inputType(field.type)}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
      />
    </label>
  );
}

function Label({ field }: { field: Field }) {
  return (
    <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
      {field.label}
      {field.required && <span className="text-red-500"> *</span>}
    </span>
  );
}

function inputType(type: string) {
  if (type === "EMAIL") return "email";
  if (type === "PHONE") return "tel";
  if (type === "URL") return "url";
  if (type === "DATE") return "date";
  if (type === "NUMBER") return "number";

  return "text";
}


