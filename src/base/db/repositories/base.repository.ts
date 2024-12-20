import {
  FilterQuery,
  HydratedDocument,
  PaginateModel,
  PaginateOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  PipelineStage
} from "mongoose";

export class BaseRepository<T> {
  private _repository: PaginateModel<T>;

  constructor(repository: PaginateModel<T>) {
    this._repository = repository;
  }

  find(filter: FilterQuery<T>) {
    return this._repository.find(filter);
  }

  paginate(filter: FilterQuery<T>, options?: PaginateOptions) {
    return this._repository.paginate(filter, options);
  }

  findOne(filter: FilterQuery<T>) {
    return this._repository.findOne(filter);
  }

  findOneAndUpdate(filter: FilterQuery<T>, update?: UpdateQuery<T>, options?: QueryOptions<T>) {
    return this._repository.findOneAndUpdate(filter, update, options);
  }

  findByIdAndUpdate(id: any, update?: UpdateQuery<T>, options?: QueryOptions<T>) {
    return this._repository.findByIdAndUpdate(id, update, options)
  }

  deleteMany(filter: FilterQuery<T>) {
    return this._repository.deleteMany(filter);
  }

  deleteOne(filter: FilterQuery<T>) {
    return this._repository.deleteOne(filter);
  }

  getAll(): Promise<T[]> {
    return this._repository.find();
  }

  getById(id: any, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<HydratedDocument<T>> {
    return this._repository.findById(id, projection);
  }

  create(item: Omit<T, "_id">): Promise<HydratedDocument<T>> {
    return this._repository.create(item);
  }

  count(filter: FilterQuery<T>) {
    return this._repository.countDocuments(filter);
  }

  aggregate(pipeline: PipelineStage[]) {
    return this._repository.aggregate(pipeline)
  }

  insertMany(items: Omit<T, "_id">[]) {
    return this._repository.insertMany(items);
  }
}
