export enum TaskTypes {
  GENERAL = "general",
  ISSUE = "issue",
  BUG = "bug",
  INCIDENT = "incident",
  STORY = "story",
}

export enum TaskStatus {
  PENDING = "pending",
  ON_GOING = "on_going",
  IN_REVIEW = "in_review",
  COMPLETED = "completed",
  REJECTED = "rejected",
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