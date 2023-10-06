import { HttpService } from '@nestjs/axios';
import { PLATFORM } from '@prisma/client';
import { ApifyExpedia, Objects } from '../object.entity';

const actorId = process.env.ACTOR_ID_APIFY_EXPEDIA;
const api_token = process.env.API_TOKEN_APIFY;

const extractDataExpedia = async (
  platform: PLATFORM,
  httpService: HttpService,
  url: string,
): Promise<Objects | undefined> => {
  console.log('Get info hotel');
  const response = await httpService.axiosRef.post(
    `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${api_token}`,
    {
      url,
    },
  );
  console.log('Get info hotel done');

  const result: ApifyExpedia = response?.data?.[0];

  // Apify actor trả về cả thông tin khách sạn, và danh sách reviews. Cần lưu lại datasetLastRunId trong object để get danh sách reviews trong review.service
  const infoLastRun = await httpService.axiosRef.get(
    `https://api.apify.com/v2/acts/${actorId}/runs/last?token=${api_token}`,
  );

  return {
    name: result.name,
    url,
    score: result.score,
    numberScoreReview: result.numberScoreReview,
    platform: platform,
    extra: {
      ...result.extra,
      datasetId: infoLastRun?.data?.data?.defaultDatasetId,
    },
    updatedAt: new Date(),
  };
};

export default extractDataExpedia;