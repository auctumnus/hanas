import { Controller, Get } from '@nestjs/common'
import {ApiExtraModels, ApiOperation, ApiProperty, ApiTags} from '@nestjs/swagger'
import { AppService } from './app.service'

class APIInfo {
  @ApiProperty({ example: '0.1.0' })
  version: string
  @ApiProperty()
  timestamp: Date
}

@ApiTags('API Info')
@ApiExtraModels(APIInfo)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    description: 'its a description',
    summary: 'its a summary'
  })
  get(): APIInfo {
    return this.appService.get()
  }
}
