export enum TaskTypes {
  GENERAL = "general",
  ISSUE = "issue",
  BUG = "bug",
}

export enum TaskStatus {
  TODO = "to-do",
  INPROGRESS = "in-progress",
  DONE = "done"
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export enum TaskActivityType {
  Update = "update",
  Comment = "comment",
  Mention = "mention",
  Other = "other",
  Push = "push",
  Deployment = "deployment",
}