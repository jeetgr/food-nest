import type { AnyFieldApi } from "@tanstack/react-form";

export function FieldError({ field }: { field: AnyFieldApi }) {
  const { isTouched, isValid, errors } = field.state.meta;

  if (!isTouched || isValid || errors.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 space-y-1">
      {/* Validation Errors */}
      {!isValid && errors.length > 0 && (
        <ul className="fade-in animate-in list-inside list-disc text-sm text-red-500 duration-300">
          {errors.map((err) => (
            <li key={err?.message} className="leading-snug">
              {err?.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
