type Values = {
  familyName?: string;
  givenName?: string;
  relation?: string | null;
  phone?: string | null;
  email?: string | null;
};

export function GuardianForm({
  action,
  defaultValues,
  submitLabel = '保存',
}: {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Values;
  submitLabel?: string;
}) {
  const v = defaultValues ?? {};
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="姓" name="familyName" required defaultValue={v.familyName} />
        <Field label="名" name="givenName" required defaultValue={v.givenName} />
        <Field label="続柄" name="relation" placeholder="例: 父 / 母 / 祖母" defaultValue={v.relation ?? ''} />
        <Field label="電話" name="phone" type="tel" defaultValue={v.phone ?? ''} />
        <Field label="メール" name="email" type="email" defaultValue={v.email ?? ''} />
      </div>
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      {label}
      {required && <span className="ml-1 text-rose-600">*</span>}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border px-3 py-2"
      />
    </label>
  );
}
