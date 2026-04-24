type ChildFormValues = {
  familyName?: string;
  givenName?: string;
  familyNameKana?: string | null;
  givenNameKana?: string | null;
  birthDate?: string;
  enrolledOn?: string;
  withdrewOn?: string | null;
  photoConsent?: boolean;
};

type ChildFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: ChildFormValues;
  submitLabel?: string;
};

export function ChildForm({ action, defaultValues, submitLabel = '保存' }: ChildFormProps) {
  const v = defaultValues ?? {};
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="姓" name="familyName" required defaultValue={v.familyName} />
        <Field label="名" name="givenName" required defaultValue={v.givenName} />
        <Field label="姓(かな)" name="familyNameKana" defaultValue={v.familyNameKana ?? ''} />
        <Field label="名(かな)" name="givenNameKana" defaultValue={v.givenNameKana ?? ''} />
        <Field label="生年月日" name="birthDate" type="date" required defaultValue={v.birthDate} />
        <Field label="入園日" name="enrolledOn" type="date" required defaultValue={v.enrolledOn} />
        <Field label="退園日" name="withdrewOn" type="date" defaultValue={v.withdrewOn ?? ''} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="photoConsent"
          defaultChecked={v.photoConsent}
          className="size-4"
        />
        SNS・園便り等での顔写真利用について保護者同意を得ている
      </label>
      <div className="pt-2">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {required && <span className="ml-1 text-rose-600">*</span>}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
      />
    </label>
  );
}
