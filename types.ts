type WeightedRangeFunction = (
  min: number,
  max: number,
  sum?: number,
  power?: number
) => number;

interface EventProperties {
  [key: string]: any[];
}

interface EventConfig {
  event: string;
  weight: number;
  properties: EventProperties;
  isFirstEvent?: boolean;
}

interface UserProperties {
  [key: string]: any[];
}

interface GroupProperties {
  [key: string]: {
    [property: string]: any[];
  };
}

interface LookupTable {
  key: string;
  entries: number;
  attributes: {
    [attribute: string]: any[];
  };
}

/**
 * The configuration object for the fake data simulator
 */
export interface Dungeon {
  seed: string;
  numDays: number;
  numEvents: number;
  numUsers: number;
  events: EventConfig[];
  superProps: {
    [prop: string]: any[];
  };
  userProps: UserProperties;
  scdProps: {
    [prop: string]: any;
  };
  groupKeys: Array<[string, number]>;
  groupProps: GroupProperties;
  lookupTables: LookupTable[];
}

/**
 * The configuration object for the batch request job
 */
export interface BatchRequestConfig {
  /**  The URL of the API endpoint. */
  url: string;
  /**  An array of data objects to be sent in the requests. */
  data: object[];
  /**  The number of records to be sent in each batch. */
  batchSize: number;
  /**  The level of concurrency for the requests. */
  concurrency: number;
  /**  An object representing the search parameters to be appended to the URL. */
  searchParams: object | null;
  /**  An object representing the body parameters to be sent in the request. */
  bodyParams: object | null;
  /**  An object representing the headers to be sent in the request. */
  headers: object;
}
