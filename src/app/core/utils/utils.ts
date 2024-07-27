import { TextRecord } from '../../models/text-record.type';

export const sortingStringsMethod = (
  firstString: string,
  secondString: string
) => {
  return firstString.localeCompare(secondString, 'en', { sensitivity: 'base' });
};

export function generateRandomIndexOfArrayIndexes(arrayLength: number): number {
  return Math.floor(Math.random() * arrayLength);
}

export function isTextRecordArray(
  data: Record<string, any>[]
): data is TextRecord[] {
  return !!data.length && 'value' in data[0] && 'isDisplayed' in data[0];
}
