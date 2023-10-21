import * as bcrypt from "bcrypt";

const salt = Number(process.env.SALT_ROUND);

export const hash = async (text: string): Promise<string> => {
  return bcrypt.hash(text, salt);
};

export const compair = async (
  plain: string,
  hashed: string,
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};
