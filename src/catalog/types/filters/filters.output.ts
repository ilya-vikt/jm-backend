export type FilterType = 'NUMBER' | 'BOOLEAN' | 'LIST' | 'MULTILIST';

export type FilterOutput = {
  id: number;
  name: string;
  caption: string;
  type: FilterType;
  meta: object;
  possibleValues:
    | {
        id: number;
        value: string;
      }[]
    | null;
};
