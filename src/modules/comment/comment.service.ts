import { prisma } from "../../lib/prisma";
import {
  ICreateCommentPayload,
  IModerateCommentPayload,
  IUpdateCommentPayload,
} from "./comment.interface";

const createComment = async (
  authorId: string,
  payload: ICreateCommentPayload,
) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });
  const comment = await prisma.comments.create({
    data: {
      ...payload,
      authorId,
    },
  });
  return comment;
};

const getCommentsByAuthorId = async (authorId: string) => {
  const comments = await prisma.comments.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  return comments;
};

const getCommentByPostId = async (postId: string) => {
  const comment = await prisma.comments.findMany({
    where: {
      postId,
    },
  });
  return comment;
};

const updateComment = async (
  commentId: string,
  data: IUpdateCommentPayload,
  authorId: string,
) => {
  const commentData = await prisma.comments.findFirstOrThrow({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });
  // if (!commentData) {
  //   throw new Error("Comment not found or you are not the author");
  // }
  const comment = await prisma.comments.update({
    where: {
      id: commentId,
      authorId,
    },
    data,
  });
  return comment;
};

const deleteComment = async (commentId: string, authorId: string) => {
  const commentData = await prisma.comments.findFirstOrThrow({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });
  // if (!commentData) {
  //   throw new Error("Comment not found or you are not the author");
  // }
  const comment = await prisma.comments.delete({
    where: {
      id: commentId,
      authorId,
    },
  });
  return null;
};
const moderateComment = async (id: string, data: IModerateCommentPayload) => {
  const commentData = await prisma.comments.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
    },
  });
  if (commentData.status === data.status) {
    throw new Error("Comment is already in the same status");
  }
  const comment = await prisma.comments.update({
    where: {
      id,
    },
    data,
  });
  return comment;
};

export const commentService = {
  createComment,
  getCommentsByAuthorId,
  getCommentByPostId,
  updateComment,
  deleteComment,
  moderateComment,
};
