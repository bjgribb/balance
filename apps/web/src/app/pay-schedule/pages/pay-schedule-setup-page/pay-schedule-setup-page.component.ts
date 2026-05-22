import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { PayFrequency, PayScheduleResponse } from '../../models/pay-schedule.models';
import { PayScheduleApiService } from '../../services/pay-schedule-api.service';

interface FrequencyOption {
    value: PayFrequency;
    label: string;
}

@Component({
    selector: 'app-pay-schedule-setup-page',
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
    ],
    templateUrl: './pay-schedule-setup-page.component.html',
    styleUrl: './pay-schedule-setup-page.component.scss',
})
export class PayScheduleSetupPageComponent {
    private readonly fb = inject(FormBuilder);
    private readonly payScheduleApi = inject(PayScheduleApiService);

    protected readonly loading = signal(true);
    protected readonly saving = signal(false);
    protected readonly hasExistingSchedule = signal(false);
    protected readonly errorMessage = signal<string | null>(null);
    protected readonly successMessage = signal<string | null>(null);

    protected readonly frequencyOptions: FrequencyOption[] = [
        { value: PayFrequency.Weekly, label: 'Weekly' },
        { value: PayFrequency.BiWeekly, label: 'Every 2 weeks' },
        { value: PayFrequency.SemiMonthly, label: 'Twice per month' },
        { value: PayFrequency.Monthly, label: 'Monthly' },
    ];

    protected readonly form = this.fb.group({
        frequency: this.fb.control<PayFrequency | null>(null, Validators.required),
        anchorPayDate: this.fb.control<Date | null>(null, Validators.required),
        estimatedPayAmount: this.fb.control<number | null>(null, [
            Validators.required,
            Validators.min(0.01),
        ]),
    });

    constructor() {
        this.loadPaySchedule();
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.saving.set(true);
        this.errorMessage.set(null);
        this.successMessage.set(null);

        const raw = this.form.getRawValue();
        const payload = {
            frequency: raw.frequency!,
            anchorPayDate: this.toApiDate(raw.anchorPayDate!),
            estimatedPayAmount: raw.estimatedPayAmount!,
        };

        const operation$ = this.hasExistingSchedule()
            ? this.payScheduleApi.update(payload)
            : this.payScheduleApi.create(payload);

        operation$.pipe(finalize(() => this.saving.set(false))).subscribe({
            next: (response) => {
                this.applySchedule(response);
                this.successMessage.set('Pay schedule saved. You can update this anytime.');
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage.set(this.extractApiError(error));
            },
        });
    }

    private loadPaySchedule(): void {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.payScheduleApi
            .get()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: (response) => {
                    this.applySchedule(response);
                },
                error: (error: HttpErrorResponse) => {
                    if (error.status === 404) {
                        this.hasExistingSchedule.set(false);
                        return;
                    }

                    this.errorMessage.set(this.extractApiError(error));
                },
            });
    }

    private applySchedule(response: PayScheduleResponse): void {
        this.hasExistingSchedule.set(true);

        this.form.patchValue({
            frequency: response.frequency,
            anchorPayDate: this.fromApiDate(response.anchorPayDate),
            estimatedPayAmount: response.estimatedPayAmount,
        });
    }

    private extractApiError(error: HttpErrorResponse): string {
        const fallback = 'Unable to save your pay schedule right now.';

        const payload = error.error;
        if (payload && typeof payload === 'object' && Array.isArray((payload as { errors?: unknown }).errors)) {
            const errors = (payload as { errors: string[] }).errors;
            if (errors.length > 0) {
                return errors.join(' ');
            }
        }

        if (error.status === 0) {
            return 'Cannot reach the API right now. Please check your connection and try again.';
        }

        return fallback;
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
