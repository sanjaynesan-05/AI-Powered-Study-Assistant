/**
 * Action Types representing structured multi-agent intentions
 */
export type ActionType =
  | "GENERATE_COURSE"
  | "GENERATE_ASSESSMENT"
  | "GET_RECOMMENDATIONS"
  | "CHAT";

/**
 * AI Mentor Chat Message Interface
 */
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date | string;
  topic?: string;
  isError?: boolean;
  actionType?: ActionType;
}

/**
 * Study Topic Interface
 */
export interface StudyTopic {
  id: string;
  name: string;
  description: string;
  icon?: string;
}
