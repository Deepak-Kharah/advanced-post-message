import { v4 as uuid } from "uuid";

export function uniqueId(prefix?: string) {
    const suffix = uuid().split("-")[0];
    return prefix ? `${prefix}-${suffix}` : suffix;
}
