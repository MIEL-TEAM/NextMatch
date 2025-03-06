"use server";

import { prisma } from "@/lib/prisma";
import { GetMemberParams, PaginatedResponse } from "@/types";
import { Member, Photo } from "@prisma/client";
import { addYears } from "date-fns";
import { getAuthUserId } from "./authActions";

export async function getMembers({
  ageRange = "18,100",
  gender = "male,female",
  orderBy = "updated",
  pageNumber = "1",
  pageSize = "12",
  withPhoto = "true",
  onlineOnly = "false",
}: GetMemberParams): Promise<PaginatedResponse<Member>> {
  const userId = await getAuthUserId();

  const [minAge, maxAge] = ageRange.split(",");

  const currentDate = new Date();

  const minDob = addYears(currentDate, -maxAge - 1);
  const maxDob = addYears(currentDate, -minAge);

  const selectedGender = gender.split(",");

  const page = parseInt(pageNumber);
  const limit = parseInt(pageSize);
  const skip = (page - 1) * limit;

  const onlineThreshold = new Date();
  onlineThreshold.setMinutes(onlineThreshold.getMinutes() - 15);

  let orderByField = "updated";
  let orderDirection: "asc" | "desc" = "desc";

  switch (orderBy) {
    case "newest":
      orderByField = "created";
      orderDirection = "desc";
      break;
    case "online":
      orderByField = "updated";
      orderDirection = "desc";
      break;
    case "distance":
      orderByField = "city";
      orderDirection = "asc";
      break;
    default:
      orderByField = "updated";
      orderDirection = "desc";
  }

  try {
    const whereClause = {
      AND: [
        { dateOfBirth: { gte: minDob } },
        { dateOfBirth: { lte: maxDob } },
        { gender: { in: selectedGender } },
        ...(withPhoto === "true" ? [{ image: { not: null } }] : []),
        ...(onlineOnly === "true"
          ? [{ updated: { gte: onlineThreshold } }]
          : []),
      ],
      NOT: {
        userId,
      },
    };

    const count = await prisma.member.count({ where: whereClause });

    const members = await prisma.member.findMany({
      where: whereClause,
      orderBy: { [orderByField]: orderDirection },
      skip,
      take: limit,
    });

    return {
      items: members,
      totalCount: count,
    };
  } catch (error) {
    console.error(
      "Error fetching members:",
      error ? JSON.stringify(error) : "Unknown error"
    );

    return {
      items: [],
      totalCount: 0,
    };
  }
}

export async function getMemberByUserId(userId: string) {
  try {
    return prisma.member.findUnique({
      where: { userId },
    });
  } catch (error) {
    console.error(
      "Error fetching member by user ID:",
      error ? JSON.stringify(error) : "Unknown error"
    );
    return null;
  }
}

export async function getMemberPhotosByUserId(userId: string) {
  try {
    const currentUserId = await getAuthUserId();
    const member = await prisma.member.findUnique({
      where: { userId },
      select: {
        photos: {
          where: currentUserId === userId ? {} : { isApproved: true },
        },
      },
    });

    if (!member) return null;

    return member.photos as Photo[];
  } catch (error) {
    console.error(
      "Error fetching member photos by user ID:",
      error ? JSON.stringify(error) : "Unknown error"
    );
    return null;
  }
}

export async function updateLastActive() {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      console.error("No authenticated user found");
      return null;
    }

    return prisma.member.update({
      where: { userId },
      data: { updated: new Date() },
    });
  } catch (error) {
    console.error(
      "Error updating last active:",
      error ? JSON.stringify(error) : "Unknown error"
    );
    return null;
  }
}

export async function getMemberPhotos(userId: string) {
  try {
    if (!userId) {
      console.error("No user ID provided for fetching photos");
      return [];
    }

    const photos = await prisma.photo.findMany({
      where: {
        member: {
          userId: userId,
        },
      },
      orderBy: {
        isApproved: "desc",
      },
    });

    return photos;
  } catch (error) {
    console.error(
      "Error fetching member photos:",
      error ? JSON.stringify(error) : "Unknown error"
    );
    return [];
  }
}
