class ApiError extends Error{
    constructor(
        statusCode,
        message="Error occured",
        errors = [],
    ){
        super(message);
        this.message = message;
        this.statusCode = statusCode
        this.errors = errors
    }
}

export {ApiError}