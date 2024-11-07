export interface Entity<T> {
    readonly id: string;
    setData(data: Partial<T>): string[];
};
