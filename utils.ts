export function GetRandomElement<T>(array: T[]): T {
    const random_idx = Math.floor(Math.random() * array.length);
    return array[random_idx];
}

export function GetAndRemoveRandomElement<T>(array: T[]): [T, T[]] {
    const random_idx = Math.floor(Math.random() * array.length);

    return [array[random_idx], array.filter((_, idx) => idx !== random_idx)];
}

export function GetAndRemoveRandomElementFromSet<T>(set: Set<T>): [T, Set<T>] {
    const elements = Array.from(set)
    const [randomElement, newElements] = GetAndRemoveRandomElement(elements);

    return [randomElement, new Set(newElements)]
}

