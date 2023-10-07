import * as bcrypt from 'bcrypt';
import { resourceUsage } from 'process';

const salt = process.env.SALT_DEFAULT;

export const hash = async (text: string): Promise<string> => {
    return bcrypt.hash(salt, text);
}

export const compair = async (first: string, second: string): Promise<boolean> => {
    return bcrypt.compare(first, second);
}