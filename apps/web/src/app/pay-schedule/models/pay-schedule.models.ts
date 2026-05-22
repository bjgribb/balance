export enum PayFrequency {
    Weekly = 0,
    BiWeekly = 1,
    SemiMonthly = 2,
    Monthly = 3,
}

export interface CreatePayScheduleRequest {
    frequency: PayFrequency;
    anchorPayDate: string;
    estimatedPayAmount: number;
}

export interface UpdatePayScheduleRequest {
    frequency: PayFrequency;
    anchorPayDate: string;
    estimatedPayAmount: number;
}

export interface PayScheduleResponse {
    id: string;
    frequency: PayFrequency;
    anchorPayDate: string;
    estimatedPayAmount: number;
    createdAtUtc: string;
}
