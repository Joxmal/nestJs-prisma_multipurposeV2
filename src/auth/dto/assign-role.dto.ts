// src/auth/dto/assign-role.dto.ts

import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  roleId: number;
}
