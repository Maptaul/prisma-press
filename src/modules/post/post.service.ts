import { prisma } from "../../lib/prisma";
import { iCreatePostPayload } from "./post.interface";

const createPost = async (payload: iCreatePostPayload, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = () => {};

const getPostStats = () => {};

const getMyPosts = () => {};

const getPostById = () => {};

const updatePost = () => {};

const deletePost = () => {};

export const postService = {
  createPost,
  getAllPosts,
  getPostStats,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};
