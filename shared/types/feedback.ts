export type FeedbackType = 'bug' | 'feature-request' | 'general-feedback';
export type FeedbackStatus = 'new' | 'reviewed' | 'in-progress' | 'resolved' | 'closed';

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
  createdAt: string;
  updatedAt: string;
}
