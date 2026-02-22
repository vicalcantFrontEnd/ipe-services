import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Infrastructure
import { ConfigModule } from './config';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

// Common
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor, TransformInterceptor, TimeoutInterceptor } from './common/interceptors';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Domain modules — Active CRUDs
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { DiplomadosModule } from './modules/diplomados/diplomados.module';

// Domain modules — Stubs (for future phases)
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ClinicalRecordsModule } from './modules/clinical-records/clinical-records.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // Infrastructure
    ConfigModule,
    PrismaModule,
    EventEmitterModule.forRoot({ wildcard: true, maxListeners: 20 }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Auth
    AuthModule,

    // Health
    HealthModule,

    // Active CRUDs (Admin Panel)
    UsersModule,
    StudentsModule,
    DiplomadosModule,

    // Future phases
    PatientsModule,
    AppointmentsModule,
    ClinicalRecordsModule,
    EnrollmentsModule,
    BillingModule,
    NotificationsModule,
  ],
  providers: [
    // Global guards (order matters: JWT first, then Roles, then Throttle)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    // Global filters
    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    // Global interceptors
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
