export interface ContestCardProps {
  readonly contest: {
    readonly id: string;
    readonly slug: string;
    readonly name: string;
    readonly institution: string;
    readonly role: string;
    readonly examDate?: Date | null;
    readonly isPrimary: boolean;
  };
}
