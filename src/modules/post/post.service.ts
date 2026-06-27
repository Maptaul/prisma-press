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

const getAllPosts = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return posts;
};

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
