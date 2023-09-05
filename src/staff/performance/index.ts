import { PrismaService } from 'src/prisma/prisma.service';
import { QueryReviewByDayStaff } from '../staff.dto';
import { checkExist, checkExistMoreThanOne } from '../staff.service';
import { tbReview, tbStaff } from '@prisma/client';

export const reviewsByDayStaff = async (
  prismaService: PrismaService,
  query: QueryReviewByDayStaff,
): Promise<tbReview[]> => {
  const staff = await prismaService.tbStaff.findFirst({
    where: {
      id: query.tbStaffId,
    },
  });
  console.log(staff, 'debugger;');

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
      createdAt: 'desc',
    },
    include: {
      tbHotel: true,
    },
  });

  let reviews: tbReview[] = [];
  listReviews.map((review) => {
    console.log(review, 'debugger;');
    let checked = false;
    review.content.map((text) => {
      const staffs: tbStaff[] = checkExistMoreThanOne(text, listStaffs);
      if (staffs.length === 1 && staffs[0].id === staff.id) {
        checked = true;
      }
    });
    if (checked) {
      reviews = reviews.concat(review);
    }
  });

  return reviews;
};
