import { PrismaService } from "src/prisma/prisma.service";
import { QueryRankByDayStaff } from "../staff.dto";
import { checkExist, checkExistMoreThanOne } from "../staff.service";
import { PLATFORM, tbReview, tbStaff } from "@prisma/client";

export const reviewsByDayStaff = async (
  prismaService: PrismaService,
  query: QueryRankByDayStaff,
): Promise<tbReview[]> => {
  const staff = await prismaService.tbStaff.findFirst({
    where: {
      id: query.tbStaffId,
    },
  });
  console.log(staff, "debugger;");

  const listStaffs = await prismaService.tbStaff.findMany({
    where: {
      tbHotelId: staff.tbHotelId,
    },
  });
  const listReviews = await prismaService.tbReview.findMany({
    where: {
      tbHotelId: staff.tbHotelId,
      platform: query.platform,
      AND: [
        {
          createdAt: {
            gt: new Date(query.start),
          },
        },
        {
          createdAt: {
            lte: new Date(query.end),
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tbHotel: true,
    },
  });

  let reviews: tbReview[] = [];
  listReviews.map((review) => {
    let checked = false;
    review.content.map((text) => {
      const staffs: tbStaff[] = checkExistMoreThanOne(text, listStaffs);
      if (staffs.length === 1 && staffs[0].id === staff.id) {
        if (query.platform === PLATFORM.TRIP && review.extra["stars"] === 5) {
          checked = true;
        }
        if (
          query.platform === PLATFORM.BOOKING &&
          review.extra["score"] >= 9.0
        ) {
          checked = true;
        }
        if (query.platform === PLATFORM.GOOGLE && review.extra["score"] === 5) {
          checked = true;
        }
      }
    });
    if (checked) {
      reviews = reviews.concat(review);
    }
  });

  return reviews;
};
