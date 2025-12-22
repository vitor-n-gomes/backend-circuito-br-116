const locationIds = [
    2,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
]

export const getRandomId = (range: number = 10): number => {
    return Math.floor(Math.random() * range) + 1;
};

export const getRandomLocationId = (): number => {
    const randomIndex = Math.floor(Math.random() * locationIds.length);
    return locationIds[randomIndex];
};

