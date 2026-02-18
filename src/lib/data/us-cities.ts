/**
 * Top 50 US metro areas by population.
 * Each entry has a representative zip code for mapping search_results coverage.
 * Region slugs use full state names to match existing DB convention.
 */

export interface SeedCity {
  city: string;
  citySlug: string;
  region: string;
  regionSlug: string;
  zip: string;
}

export const US_CITIES: SeedCity[] = [
  { city: "New York", citySlug: "new-york", region: "New York", regionSlug: "new-york", zip: "10001" },
  { city: "Los Angeles", citySlug: "los-angeles", region: "California", regionSlug: "california", zip: "90001" },
  { city: "Chicago", citySlug: "chicago", region: "Illinois", regionSlug: "illinois", zip: "60601" },
  { city: "Houston", citySlug: "houston", region: "Texas", regionSlug: "texas", zip: "77001" },
  { city: "Phoenix", citySlug: "phoenix", region: "Arizona", regionSlug: "arizona", zip: "85001" },
  { city: "Philadelphia", citySlug: "philadelphia", region: "Pennsylvania", regionSlug: "pennsylvania", zip: "19101" },
  { city: "San Antonio", citySlug: "san-antonio", region: "Texas", regionSlug: "texas", zip: "78201" },
  { city: "San Diego", citySlug: "san-diego", region: "California", regionSlug: "california", zip: "92101" },
  { city: "Dallas", citySlug: "dallas", region: "Texas", regionSlug: "texas", zip: "75201" },
  { city: "Austin", citySlug: "austin", region: "Texas", regionSlug: "texas", zip: "78701" },
  { city: "Jacksonville", citySlug: "jacksonville", region: "Florida", regionSlug: "florida", zip: "32099" },
  { city: "San Jose", citySlug: "san-jose", region: "California", regionSlug: "california", zip: "95101" },
  { city: "Fort Worth", citySlug: "fort-worth", region: "Texas", regionSlug: "texas", zip: "76101" },
  { city: "Columbus", citySlug: "columbus", region: "Ohio", regionSlug: "ohio", zip: "43085" },
  { city: "Charlotte", citySlug: "charlotte", region: "North Carolina", regionSlug: "north-carolina", zip: "28201" },
  { city: "Indianapolis", citySlug: "indianapolis", region: "Indiana", regionSlug: "indiana", zip: "46201" },
  { city: "San Francisco", citySlug: "san-francisco", region: "California", regionSlug: "california", zip: "94102" },
  { city: "Seattle", citySlug: "seattle", region: "Washington", regionSlug: "washington", zip: "98101" },
  { city: "Denver", citySlug: "denver", region: "Colorado", regionSlug: "colorado", zip: "80201" },
  { city: "Nashville", citySlug: "nashville", region: "Tennessee", regionSlug: "tennessee", zip: "37201" },
  { city: "Oklahoma City", citySlug: "oklahoma-city", region: "Oklahoma", regionSlug: "oklahoma", zip: "73101" },
  { city: "Washington", citySlug: "washington", region: "District of Columbia", regionSlug: "district-of-columbia", zip: "20001" },
  { city: "El Paso", citySlug: "el-paso", region: "Texas", regionSlug: "texas", zip: "79901" },
  { city: "Boston", citySlug: "boston", region: "Massachusetts", regionSlug: "massachusetts", zip: "02101" },
  { city: "Las Vegas", citySlug: "las-vegas", region: "Nevada", regionSlug: "nevada", zip: "89101" },
  { city: "Portland", citySlug: "portland", region: "Oregon", regionSlug: "oregon", zip: "97201" },
  { city: "Memphis", citySlug: "memphis", region: "Tennessee", regionSlug: "tennessee", zip: "38101" },
  { city: "Louisville", citySlug: "louisville", region: "Kentucky", regionSlug: "kentucky", zip: "40201" },
  { city: "Baltimore", citySlug: "baltimore", region: "Maryland", regionSlug: "maryland", zip: "21201" },
  { city: "Milwaukee", citySlug: "milwaukee", region: "Wisconsin", regionSlug: "wisconsin", zip: "53201" },
  { city: "Albuquerque", citySlug: "albuquerque", region: "New Mexico", regionSlug: "new-mexico", zip: "87101" },
  { city: "Tucson", citySlug: "tucson", region: "Arizona", regionSlug: "arizona", zip: "85701" },
  { city: "Fresno", citySlug: "fresno", region: "California", regionSlug: "california", zip: "93701" },
  { city: "Sacramento", citySlug: "sacramento", region: "California", regionSlug: "california", zip: "95814" },
  { city: "Mesa", citySlug: "mesa", region: "Arizona", regionSlug: "arizona", zip: "85201" },
  { city: "Kansas City", citySlug: "kansas-city", region: "Missouri", regionSlug: "missouri", zip: "64101" },
  { city: "Atlanta", citySlug: "atlanta", region: "Georgia", regionSlug: "georgia", zip: "30301" },
  { city: "Omaha", citySlug: "omaha", region: "Nebraska", regionSlug: "nebraska", zip: "68101" },
  { city: "Colorado Springs", citySlug: "colorado-springs", region: "Colorado", regionSlug: "colorado", zip: "80901" },
  { city: "Raleigh", citySlug: "raleigh", region: "North Carolina", regionSlug: "north-carolina", zip: "27601" },
  { city: "Long Beach", citySlug: "long-beach", region: "California", regionSlug: "california", zip: "90801" },
  { city: "Virginia Beach", citySlug: "virginia-beach", region: "Virginia", regionSlug: "virginia", zip: "23450" },
  { city: "Miami", citySlug: "miami", region: "Florida", regionSlug: "florida", zip: "33101" },
  { city: "Tampa", citySlug: "tampa", region: "Florida", regionSlug: "florida", zip: "33601" },
  { city: "Orlando", citySlug: "orlando", region: "Florida", regionSlug: "florida", zip: "32801" },
  { city: "Minneapolis", citySlug: "minneapolis", region: "Minnesota", regionSlug: "minnesota", zip: "55401" },
  { city: "New Orleans", citySlug: "new-orleans", region: "Louisiana", regionSlug: "louisiana", zip: "70112" },
  { city: "Cleveland", citySlug: "cleveland", region: "Ohio", regionSlug: "ohio", zip: "44101" },
  { city: "Pittsburgh", citySlug: "pittsburgh", region: "Pennsylvania", regionSlug: "pennsylvania", zip: "15201" },
  { city: "St. Louis", citySlug: "st-louis", region: "Missouri", regionSlug: "missouri", zip: "63101" },
];

/** Lookup map: zip code → seed city */
export const ZIP_TO_CITY = new Map(US_CITIES.map((c) => [c.zip, c]));
