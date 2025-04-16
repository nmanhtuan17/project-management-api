import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import {  plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { MilsetoneFilterDto } from '@/modules/project/dto/project.dto';

export const MilsetoneFilter = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<MilsetoneFilterDto> => {
    const request = ctx.switchToHttp().getRequest();
    const queries = request.query;
    const milestoneFilterDto = plainToInstance(MilsetoneFilterDto, queries, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(milestoneFilterDto);
    if (errors && errors.length > 0) throw new BadRequestException(errors[0].constraints?.isEnum);
    return milestoneFilterDto;
  },
);

export function ApiMilestoneFilter() {
  return applyDecorators(
    ApiQuery({ name: 'query', required: false, type: String }),
    ApiQuery({ name: 'closed', required: false, type: Boolean })
  );
}