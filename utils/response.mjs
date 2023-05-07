export const response = ( code, msg) => {
    return {
        statusCode: code,
        body: JSON.stringify(msg),
    }
}