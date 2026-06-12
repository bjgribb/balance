import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  type CreateFixedExpenseRequest,
  type FixedExpenseResponse,
  RecurrenceUnit,
} from '../../models/fixed-expense.models';

interface RecurrenceOption {
  readonly value: RecurrenceUnit;
  readonly label: string;
}

export interface FixedExpenseDialogData {
  readonly mode: 'create' | 'edit';
  readonly expense?: FixedExpenseResponse;
}

@Component({
  selector: 'app-fixed-expense-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './fixed-expense-dialog.component.html',
  styleUrl: './fixed-expense-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixedExpenseDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FixedExpenseDialogComponent>);
  private readonly data = inject<FixedExpenseDialogData>(MAT_DIALOG_DATA);

  protected readonly recurrenceOptions: readonly RecurrenceOption[] = [
    { value: RecurrenceUnit.Day, label: 'Day' },
    { value: RecurrenceUnit.Week, label: 'Week' },
    { value: RecurrenceUnit.Month, label: 'Month' },
  ];

  protected readonly title = this.data.mode === 'edit' ? 'Edit Fixed Expense' : 'Add Fixed Expense';
  protected readonly submitLabel = this.data.mode === 'edit' ? 'Save changes' : 'Add fixed expense';

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data.expense?.name ?? '', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    amount: this.fb.control<number | null>(this.data.expense?.amount ?? null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    anchorDate: this.fb.control<Date | null>(
      this.data.expense ? this.fromApiDate(this.data.expense.anchorDate) : null,
      Validators.required,
    ),
    recurrenceUnit: this.fb.control<RecurrenceUnit | null>(
      this.data.expense?.recurrenceUnit ?? RecurrenceUnit.Month,
      Validators.required,
    ),
    recurrenceInterval: this.fb.control<number | null>(this.data.expense?.recurrenceInterval ?? 1, [
      Validators.required,
      Validators.min(1),
    ]),
    skipUntilDate: this.fb.control<Date | null>(
      this.data.expense?.skipUntilDate ? this.fromApiDate(this.data.expense.skipUntilDate) : null,
    ),
    isActive: this.fb.control(this.data.expense?.isActive ?? true, Validators.required),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CreateFixedExpenseRequest = {
      name: raw.name!.trim(),
      amount: raw.amount!,
      anchorDate: this.toApiDate(raw.anchorDate!),
      recurrenceUnit: raw.recurrenceUnit!,
      recurrenceInterval: raw.recurrenceInterval!,
      skipUntilDate: raw.skipUntilDate ? this.toApiDate(raw.skipUntilDate) : null,
      isActive: raw.isActive!,
    };

    this.dialogRef.close(payload);
  }

  private toApiDate(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromApiDate(value: string): Date {
    const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
    return new Date(year, month - 1, day);
  }
}
