import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { postService } from "./post.service";

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;
    const result = await postService.createPost(payload, id as string);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Post created successfully",
      data: result,
    });
  },
);

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getAllPosts();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Posts retrieved successfully",
      data: result,
    });
  },
);

const getPostStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const result = await postService.getMyPosts(authorId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Posts retrieved successfully",
      data: result,
    });
  },
);

const getPostById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    if (!postId) {
      throw new Error("Post ID is required");
    }
    const result = await postService.getPostById(postId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Post retrieved successfully",
      data: result,
    });
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const postController = {
  createPost,
  getAllPosts,
  getPostStats,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};
