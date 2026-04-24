export type TenantId = string & { readonly __brand: 'TenantId' };

export const asTenantId = (value: string): TenantId => value as TenantId;
