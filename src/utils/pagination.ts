export type PaginationQuery = {
  page?: string | number;
  limit?: string | number;
  search?: string;
};

type PaginateOptions<TWhere, TOrderBy, TInclude, TSelect> = {
  model: {
    findMany: (args: any) => Promise<any[]>;
    count: (args: any) => Promise<number>;
  };
  page?: string | number;
  limit?: string | number;
  where?: TWhere;
  orderBy?: TOrderBy;
  include?: TInclude;
  select?: TSelect;
};

export const paginate = async <TWhere = any, TOrderBy = any, TInclude = any, TSelect = any>({
  model,
  page = 1,
  limit = 10,
  where,
  orderBy,
  include,
  select,
}: PaginateOptions<TWhere, TOrderBy, TInclude, TSelect>) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const skip = (currentPage - 1) * perPage;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
    }),
    model.count({
      where,
    }),
  ]);

  const lastPage = Math.ceil(total / perPage);

  return {
    data,
    meta: {
      total,
      perPage,
      currentPage,
      lastPage,
      hasNextPage: currentPage < lastPage,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage < lastPage ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
    },
  };
};