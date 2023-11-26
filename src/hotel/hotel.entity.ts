import { tbHotel, tbObject } from '@prisma/client';

export type HotelDetail = {
  objects: tbObject[];
} & tbHotel;
