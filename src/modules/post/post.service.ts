import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { postWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  iCreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";

const createPost = async (payload: iCreatePostPayload, userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      subscription: true,
    },
  });

  if (payload.isPremium && user.subscription?.status !== "ACTIVE") {
    throw new Error("Only active subscribers can create premium posts");
  }

  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPosts = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";
  const tags = query.tags ? JSON.parse(query.tags as string) : null;
  const tagsArray = Array.isArray(tags) ? tags : [];
  const andConditions: postWhereInput[] = [];
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { content: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }
  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }
  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }

  if (query.tags) {
    andConditions.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  andConditions.push({
    isPremium: false,
  });

  const posts = await prisma.post.findMany({
    // where: {
    //   AND: [
    //     //searchTerm is optional, so we need to check if it exists before adding it to the where clause
    //     query.searchTerm
    //       ? {
    //           OR: [
    //             { title: { contains: query.searchTerm, mode: "insensitive" } },
    //             {
    //               content: { contains: query.searchTerm, mode: "insensitive" },
    //             },
    //           ],
    //         }
    //       : {},
    //     //filtering by other fields if they exist in the query
    //     query.title ? { title: query.title } : {},
    //     query.content ? { content: query.content } : {},
    //     query.status ? { status: query.status } : {},
    //     query.isFeatured !== undefined ? { isFeatured: query.isFeatured } : {},
    //   ],
    // },

    where: {
      AND: andConditions,
    },

    //dynamically setting the limit and skip values based on the query parameters

    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

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

const getPostStats = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViewsAggregate,
    ] = await Promise.all([
      tx.post.count(),
      tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      tx.comments.count(),
      tx.comments.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      tx.comments.count({
        where: {
          status: CommentStatus.REJECTED,
        },
      }),
      tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews: totalPostViewsAggregate._sum.views ?? 0,
    };
  });

  return transactionResult;
};

const getMyPosts = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId: authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  return result;
};

const getPostById = async (postId: string) => {
  // const post = await prisma.post.findUniqueOrThrow({
  //   where: {
  //     id: postId,
  //   },
  // });
  // await prisma.post.update({
  //   where: {
  //     id: postId,
  //   },
  //   data: {
  //     views: {
  //       increment: 1,
  //     },
  //   },
  // });

  // // throw new Error("Fake error to test error handling middleware");

  // const post = await prisma.post.findUniqueOrThrow({
  //   where: {
  //     id: postId,
  //   },
  //   include: {
  //     author: {
  //       omit: {
  //         password: true,
  //       },
  //     },
  //     comments: {
  //       where: {
  //         status: CommentStatus.APPROVED,
  //       },
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //     },
  //     _count: {
  //       select: {
  //         comments: true,
  //       },
  //     },
  //   },
  // });
  // return post;

  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
        isPremium: false,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // throw new Error("Fake error to test error handling middleware");

    const post = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
        isPremium: false,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return post;
  });
  return transactionResult;
};

const updatePost = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });
  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not authorized to update this post");
  }
  const result = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });
  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not authorized to delete this post");
  }
  await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

export const postService = {
  createPost,
  getAllPosts,
  getPostStats,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};
