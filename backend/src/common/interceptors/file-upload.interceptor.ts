import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const maxFileSize = parseInt(this.configService.get('MAX_FILE_SIZE') || '104857600'); // 100MB default

    if (request.file && request.file.size > maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`);
    }

    return next.handle();
  }
}

