"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
const paginate = async ({ model, page = 1, limit = 10, where, orderBy, include, select, }) => {
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
exports.paginate = paginate;
