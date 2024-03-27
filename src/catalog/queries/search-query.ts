/**
 * SQL query that selects products, taking into account a set of installed filters
 */
const searchWidthFilters = `SELECT p.id, p.name, p.description, p.price,
p.category_id, p.thumb_id, p.gallery, p.marketing_price as "marketingPrice"
FROM
(SELECT pfv.product_id AS product_id FROM  $tableName
  LEFT JOIN "Filters" f ON ($tableName.filter_id = f.id)
  LEFT JOIN "ProductsFiltersValues" pfv ON (
    $tableName.filter_id = pfv.filter_id AND (
      (f.type = 'LIST' AND pfv.value = $tableName.value )
      OR
      (f.type = 'NUMBER' AND
        (
          CAST(pfv.value AS FLOAT)
          BETWEEN
          (string_to_array($tableName.value, ',')::FLOAT[])[1]
          AND
          (string_to_array($tableName.value, ',')::FLOAT[])[2]
        )
      )
      OR
      (f.type = 'BOOLEAN' AND
        (
          $tableName.value::BOOLEAN = pfv.value::BOOLEAN
        )
      )
      OR
      (f.type = 'MULTILIST' and string_to_array($tableName.value, ',')::INT[] <@ string_to_array(pfv.value, ',')::INT[])
    )
  )
  group BY pfv.product_id
  HAVING COUNT(pfv.product_id) = (SELECT COUNT(*) AS row_count FROM $tableName)
) AS filtered_values
LEFT JOIN "Products" p ON (filtered_values.product_id = p.id)
WHERE
$categoryFilter
$searchString
order by p.id
  offset  0 rows
  fetch next 10 rows only;
`;

/**
 * SQL query that selects products without taking into account filters
 */
const searchWidthoutFilters = `SELECT p.id, p.name, p.description, p.price,
p.category_id, p.thumb_id, p.gallery, p.marketing_price as "marketingPrice"
FROM "Products" p
WHERE 
$categoryFilter
$searchString
order by p.id
  offset  0 rows 
  fetch next 10 rows only;
`;

/**
 *
 * @param {numbers[] | null} categories array of category ids
 * @returns {string}
 * Adds a filter condition by category
 */
const getCategoryFilter = (categories: number[] | null) =>
  categories ? `p.category_id IN (${categories.join(',')})` : 'true';

/**
 *
 * @param {string} searchString search string
 * @returns {string}
 * Adds a filtering condition based on searchString matching the product name or description
 * The search is carried out using trigrams to organize a fuzzy search.
 */
const getSearchStringFilter = (searchString: string | null) =>
  searchString
    ? `AND (
  word_similarity('${searchString}', p.name) > 0.5
  OR word_similarity('${searchString}', p.description) > 0.5
)`
    : '';

/**
 *
 * @param {string} searchString search string
 * @param {number[] | null} categories array of categories
 * @param {boolean} hasFilters flag of presence of set filters
 * @param {string| null} tableName name of a temporary table with prepared filter values
 * @returns {string}
 *
 * Constructs an SQL query based on the specified parameters.
 */
export const createSearchQuery = (
  searchString: string,
  categories: number[] | null,
  hasFilters: boolean,
  tableName: string | null,
) =>
  (hasFilters
    ? searchWidthFilters.replaceAll('$tableName', tableName)
    : searchWidthoutFilters
  )
    .replace('$categoryFilter', getCategoryFilter(categories))
    .replace(
      '$searchString',
      getSearchStringFilter(searchString.replace(/[^.-\wа-яА-Я\d\s]/g, '')),
    );
