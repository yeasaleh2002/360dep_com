"use client";

import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";
import { MultiImageUpload, SingleImageUpload } from "@/components/admin/image-upload";
import type { UploadPreset } from "@/components/admin/api-client";
import { cn } from "@/lib/utils";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "image" | "images" | "switch";
  required?: boolean;
  help?: string;
  placeholder?: string;
  preset?: UploadPreset;
  aspect?: string;
  fit?: "cover" | "contain";
  rows?: number;
  /** Put two `half` fields side by side on wider screens. */
  half?: boolean;
  suggestions?: string[];
};

export type FormValues = Record<string, unknown>;

/** Turns a stored item into editable form values (nulls → empty inputs). */
export function toFormValues(fields: FieldConfig[], source: FormValues): FormValues {
  const values: FormValues = {};
  for (const f of fields) {
    const v = source[f.name];
    if (f.type === "images") values[f.name] = Array.isArray(v) ? v : [];
    else if (f.type === "switch") values[f.name] = typeof v === "boolean" ? v : false;
    else if (f.type === "image") values[f.name] = typeof v === "string" ? v : null;
    else values[f.name] = v === null || v === undefined ? "" : String(v);
  }
  return values;
}

export function ResourceForm({
  id,
  fields,
  schema,
  defaultValues,
  onSubmit,
}: {
  id: string;
  fields: FieldConfig[];
  schema: ZodTypeAny;
  defaultValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues,
  });

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 sm:grid-cols-2">
      {fields.map((field) => {
        const error = errors[field.name]?.message as string | undefined;
        const inputId = `${id}-${field.name}`;
        const wrapper = cn(field.half ? "sm:col-span-1" : "sm:col-span-2");

        if (field.type === "switch") {
          return (
            <div key={field.name} className={wrapper}>
              <label htmlFor={inputId} className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line p-4">
                <span>
                  <span className="block text-sm font-medium text-ink">{field.label}</span>
                  {field.help && <span className="mt-0.5 block text-xs text-muted">{field.help}</span>}
                </span>
                <input id={inputId} type="checkbox" className="admin-switch" {...register(field.name)} />
              </label>
            </div>
          );
        }

        return (
          <div key={field.name} className={wrapper}>
            <label htmlFor={inputId} className="field-label">
              {field.label}
              {field.required ? <span className="ml-1 text-gold-strong">*</span> : <span className="ml-2 text-xs font-normal text-muted">(optional)</span>}
            </label>

            {field.type === "image" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: f }) => (
                  <SingleImageUpload value={f.value as string | null} onChange={f.onChange} preset={field.preset} aspect={field.aspect} fit={field.fit} />
                )}
              />
            )}

            {field.type === "images" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: f }) => (
                  <MultiImageUpload value={(f.value as string[]) ?? []} onChange={f.onChange} preset={field.preset} />
                )}
              />
            )}

            {field.type === "textarea" && (
              <textarea id={inputId} rows={field.rows ?? 4} placeholder={field.placeholder} className="field resize-y" aria-invalid={!!error} {...register(field.name)} />
            )}

            {(field.type === "text" || field.type === "url" || field.type === "number") && (
              <>
                <input
                  id={inputId}
                  type={field.type === "url" ? "url" : "text"}
                  inputMode={field.type === "number" ? "numeric" : field.type === "url" ? "url" : undefined}
                  placeholder={field.placeholder}
                  list={field.suggestions?.length ? `${inputId}-list` : undefined}
                  className="field"
                  aria-invalid={!!error}
                  {...register(field.name)}
                />
                {field.suggestions?.length ? (
                  <datalist id={`${inputId}-list`}>
                    {field.suggestions.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                ) : null}
              </>
            )}

            {field.help && !error && <p className="mt-1.5 text-xs text-muted">{field.help}</p>}
            {error && <p className="field-error">{error}</p>}
          </div>
        );
      })}
    </form>
  );
}
