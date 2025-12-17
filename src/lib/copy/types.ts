export type Gender = "male" | "female" | null;

export interface CopyVariants {
  neutral: string;
  male?: string;
  female?: string;
}

export interface CopyEntry {
  id: string;
  variants: CopyVariants;
  context: string;
  notes?: string;
}
