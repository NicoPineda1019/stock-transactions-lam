export const response = ( code, msg) => {
    return {
        statusCode: code,
        body: JSON.stringify(msg),
    }
}
export const paginateResponse = (path, page, totalItems, totalPage, items) => {
    const numberPages = Math.ceil(totalItems / totalPage);
    const lastPageNumber = numberPages;
    const nextPageCalc = page++;
    const nextPageNumber = nextPageCalc > numberPages ? lastPage : nextPageCalc;
    const previousPageCalc = page--;
    const previousPageNumber = previousPageCalc < numberPages ? 1 : previousPageCalc;
    const firstPage = `${path}?page=1`;
    const previousPage =`${path}?page=${previousPageNumber}`;
    const nextPage =`${path}?page=${nextPageNumber}`;
    const lastPage =`${path}?page=${lastPageNumber}`;

    return {
        numberPages,
        firstPage,
        previousPage,
        nextPage,
        lastPage,
        items
    }
}