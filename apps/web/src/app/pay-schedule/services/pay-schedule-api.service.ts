import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    CreatePayScheduleRequest,
    PayScheduleResponse,
    UpdatePayScheduleRequest,
} from '../models/pay-schedule.models';

@Injectable({
    providedIn: 'root',
})
export class PayScheduleApiService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiBaseUrl}/api/pay-schedule`;

    get(): Observable<PayScheduleResponse> {
        return this.http.get<PayScheduleResponse>(this.url);
    }

    create(request: CreatePayScheduleRequest): Observable<PayScheduleResponse> {
        return this.http.post<PayScheduleResponse>(this.url, request);
    }

    update(request: UpdatePayScheduleRequest): Observable<PayScheduleResponse> {
        return this.http.put<PayScheduleResponse>(this.url, request);
    }
}
