import { IsBoolean, IsOptional } from 'class-validator'

export class CreateLangPermissionDto {
  @IsOptional()
  @IsBoolean()
  owner: boolean

  @IsOptional()
  @IsBoolean()
  changePermissions: boolean

  @IsOptional()
  @IsBoolean()
  changeId: boolean

  @IsOptional()
  @IsBoolean()
  changeInfo: boolean

  @IsOptional()
  @IsBoolean()
  changeWords: boolean
}
