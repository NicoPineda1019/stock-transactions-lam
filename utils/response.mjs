
const accessControl = { 'Access-Control-Allow-Origin' : '*' };

export const response = ( code, msg) => {
    return {
        statusCode: code,
        body: JSON.stringify(msg),
        headers: {
            ...accessControl
        }
    }
}
export const paginateResponse = (path, page, totalItems, totalPage, items) => {
    const numberPages = Math.ceil(Number(totalItems) / Number(totalPage));
    const lastPageNumber = numberPages;
    const nextPageCalc = page+1;
    const nextPageNumber = nextPageCalc > numberPages ? lastPageNumber : nextPageCalc;
    const previousPageCalc = page-1;
    const previousPageNumber = previousPageCalc < 1 ? 1 : previousPageCalc;
    const firstPage = `${path}?page=1`;
    const previousPage =`${path}?page=${previousPageNumber}`;
    const nextPage =`${path}?page=${nextPageNumber}`;
    const lastPage =`${path}?page=${lastPageNumber}`;

    return {
        totalItems,
        numberPages,
        firstPage,
        previousPage,
        nextPage,
        lastPage,
        items
    }
}