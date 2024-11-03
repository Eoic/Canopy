export interface Entity<T> {
    readonly id: string;
    update(data: Partial<T>): string[];
};
