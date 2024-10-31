import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import {  plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { TaskFilterDto } from '../dto/task.dto';

export const TaskFilter = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<TaskFilterDto> => {
    const request = ctx.switchToHttp().getRequest();
    const queries = request.query;
    const taskFilterDto = plainToInstance(TaskFilterDto, queries, {
      excludeExtraneousValues: true,
    });

    const errors = await validate(taskFilterDto);
    if (errors && errors.length > 0) throw new BadRequestException(errors[0].constraints?.isEnum);
    return taskFilterDto;
  },
);

export function ApiTaskFilter() {
  return applyDecorators(
    ApiQuery({ name: 'query', required: false, type: String }),
    ApiQuery({ name: 'type', required: false, type: String }),
    ApiQuery({ name: 'status', required: false, type: String }),
    ApiQuery({ name: 'priority', required: false, type: String }),
    ApiQuery({ name: 'assignees', required: false, type: String }),
    ApiQuery({ name: 'archived', required: false, type: Boolean }),
  );
}