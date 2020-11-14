import { PipeTransform, Injectable } from '@nestjs/common'

const trimIfString = (v: any) => (typeof v === 'string' ? v.trim() : v)

@Injectable()
export class TrimPipe implements PipeTransform<any, any> {
  transform(value: any): any {
    if (typeof value === 'object') {
      Object.keys(value).forEach((k) => (value[k] = trimIfString(value[k])))
    }
    return value
  }
}
