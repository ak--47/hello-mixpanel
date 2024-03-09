type WeightedRangeFunction = (min: number, max: number, sum?: number, power?: number) => number;

interface EventProperties {
    [key: string]: any;
}

interface EventConfig {
    event: string;
    weight: number;
    properties: EventProperties;
    isFirstEvent?: boolean;
}

interface UserProperties {
    [key: string]: any;
}

interface GroupProperties {
    [key: string]: {
        [property: string]: any;
    };
}

interface LookupTable {
    key: string;
    entries: number;
    attributes: {
        [attribute: string]: any[];
    };
}

export interface Config {
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
