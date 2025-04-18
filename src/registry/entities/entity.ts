export interface Entity<T> {
    readonly id: string;
    setData<K extends keyof T>(data: Pick<T, K>): K[];
}
