import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { classToClass } from 'class-transformer'

@Injectable()
export class classTransformerInterceptor<T> implements NestInterceptor<T, T> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof Error) {
          return data
        }
        return classToClass(data)
      }),
    )
  }
}
