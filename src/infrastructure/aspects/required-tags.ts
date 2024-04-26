export const requiredTags = ['namespace', 'service-name', 'service-owner'] as const;

export type RequiredTags = (typeof requiredTags)[number];

export type Tags = Record<RequiredTags, string>;
