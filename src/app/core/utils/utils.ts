export const sortingStringsMethod = (
  firstString: string,
  secondString: string
) => {
  return firstString.localeCompare(secondString, 'en', { sensitivity: 'base' });
};

export function generateRandomIndexOfArrayIndexes(arrayLength: number): number {
  return Math.floor(Math.random() * arrayLength);
}
