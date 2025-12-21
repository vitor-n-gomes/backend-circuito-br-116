export const getRandomId = (range: number = 10 ): number => {
    return Math.floor(Math.random() * range) + 1;
};