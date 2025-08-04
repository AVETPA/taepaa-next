// types/rto.d.ts

declare module '@/data/current_rto_lookup.json' {
  const value: Record<string, { name: string; status: string }>;
  export default value;
}
