import {
  IsString,
  IsInt,
  IsObject,
  IsArray,
  ValidateIf,
} from 'class-validator';

export class SearchProductsInput {
  @IsString()
  searchString: string;

  @ValidateIf((_, value) => value !== null)
  @IsInt()
  categoryId: number | null;

  @ValidateIf((_, value) => value !== null)
  @IsArray()
  @IsObject({ each: true })
  appliedFilters: { id: number; value: number | boolean | number[] }[] | null;
}
