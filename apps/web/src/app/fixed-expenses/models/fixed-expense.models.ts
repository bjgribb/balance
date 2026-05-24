export enum RecurrenceUnit {
  Day = 0,
  Week = 1,
  Month = 2,
}

export interface FixedExpenseResponse {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
  anchorDate: string;
  recurrenceUnit: RecurrenceUnit;
  recurrenceInterval: number;
  skipUntilDate: string | null;
  nextDueDate: string | null;
  createdAtUtc: string;
}
