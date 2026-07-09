export const getPagination = ({ page, pageSize }) => {

    const take = pageSize;
    const skip = (page - 1) * pageSize;

    return { take, skip };
};

export const buildPaginationMeta = ({ page, pageSize, totalRecords }) => {

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
        page,
        pageSize,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
    };
};