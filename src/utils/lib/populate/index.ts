import { Schema, VirtualType } from "mongoose";

export function getFieldsToPopulate(schema: Schema): string[] {
  const fieldsToPopulate: string[] = [];
  for (const key in schema.obj) {
    if (schema.obj[key] && typeof schema.obj[key] === 'object' && 'ref' in schema.obj[key]) {
      fieldsToPopulate.push(key);
    }
  }

  for(const key in schema.virtuals) {
    const virtual = schema.virtuals as { [key: string]: VirtualType<object> };
    if (virtual && typeof virtual === 'object' && virtual.options && 'ref' in virtual.options) {
      fieldsToPopulate.push(key);
    }
  }

  return fieldsToPopulate;
}