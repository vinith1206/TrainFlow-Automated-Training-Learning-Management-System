import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, params, query } = request;
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Determine action and entity from route
    const action = this.getAction(method);
    const entityType = this.getEntityType(url);
    const entityId = params?.id || params?.trainingId || params?.userId;

    return next.handle().pipe(
      tap(() => {
        // Log asynchronously (don't block request)
        this.auditLogsService.create({
          userId: user?.userId,
          action,
          entityType,
          entityId,
          details: {
            method,
            url,
            body: this.sanitizeBody(body),
            params,
            query,
          },
          ipAddress,
          userAgent,
        }).catch(err => {
          console.error('Failed to create audit log:', err);
          // Don't throw - audit logging failure shouldn't break the request
        });
      }),
    );
  }

  private getAction(method: string): string {
    const actionMap: Record<string, string> = {
      GET: 'VIEW',
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actionMap[method] || method;
  }

  private getEntityType(url: string): string {
    if (url.includes('/trainings')) return 'Training';
    if (url.includes('/users')) return 'User';
    if (url.includes('/enrollments')) return 'Enrollment';
    if (url.includes('/materials')) return 'Material';
    if (url.includes('/attendance')) return 'Attendance';
    if (url.includes('/feedback')) return 'Feedback';
    return 'System';
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    // Remove sensitive fields
    if (sanitized.password) delete sanitized.password;
    if (sanitized.token) delete sanitized.token;
    return sanitized;
  }
}

