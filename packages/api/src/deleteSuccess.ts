import { ApiProperty } from '@nestjs/swagger'

export class DeleteSuccess {
  @ApiProperty({ description: 'The operation was a success.', example: true })
  success: true;
}
