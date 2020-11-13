import { Injectable } from '@nestjs/common'
import { version } from '../package.json'

@Injectable()
export class AppService {
  get() {
    return {
      version,
      timestamp: new Date(),
    }
  }
}
