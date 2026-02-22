import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const StudentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

type StudentStatusValue = (typeof StudentStatus)[keyof typeof StudentStatus];

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ enum: StudentStatus, example: 'ACTIVE' })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatusValue;
}
