export interface PaginatableContextData<D> {
  data: D;
  isLoading: false | 'paginate' | 'search';
  lastKey: Record<string, any> | null;
}

export interface ContextData<D> {
  data: D;
  isLoading: boolean;
}

export interface FetchContextDataProps {
  search?: string;
  lastKey?: Record<string, any> | null;
  cancelToken?: CancelToken;
}

export interface GetPaginatedDataInput {
  pageSize: number;
  lastKey?: Record<string, any> | null;
  search?: string;
  cancelToken?: CancelToken;
}
