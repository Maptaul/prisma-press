import { PostStatus } from "../../../generated/prisma/enums";

export interface iCreatePostPayload {
  title: string;
  content: string;
  thumbnail?: string;
  isFeatured?: boolean;
  status?: PostStatus;
  tags?: string[];
}
