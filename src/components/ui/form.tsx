"use client";
import * as React from "react";
import type { UseFormReturn, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { Controller, FormProvider } from "react-hook-form";

export function Form<TFieldValues extends FieldValues>({ children, ...form }: UseFormReturn<TFieldValues> & { children: React.ReactNode }) {
  const methods = form as unknown as UseFormReturn<TFieldValues>;
  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  render,
}: {
  control: UseFormReturn<TFieldValues>["control"];
  name: TName;
  render: (props: { field: ControllerRenderProps<TFieldValues, TName> }) => React.ReactNode;
}) {
  return <Controller control={control} name={name} render={({ field }) => <>{render({ field })}</>} />;
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
      return <label className="text-sm font-medium text-black dark:text-neutral-200">{children}</label>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-sm text-red-600">{children}</p>;
}
