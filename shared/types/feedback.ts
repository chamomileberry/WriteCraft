export type FeedbackType = "bug" | "feature-request" | "general-feedback";
export type FeedbackStatus =
  | "new"
  | "reviewed"
  | "in-progress"
  | "resolved"
  | "closed";

export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  userEmail: string;
  userBrowser?: string;
  userOS?: string;
  currentPage?: string;
  adminReply?: string;
  adminRepliedAt?: Date;
  adminRepliedBy?: string;
  hasUnreadReply?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeedbackRequest {
  type: FeedbackType;
  title: string;
  description: string;
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
}

export interface FeedbackResponse {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  userEmail: string;
  userBrowser?: string;
  userOS?: string;
  currentPage?: string;
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  hasUnreadReply?: boolean;
  readAt?: string | null;
  repliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
