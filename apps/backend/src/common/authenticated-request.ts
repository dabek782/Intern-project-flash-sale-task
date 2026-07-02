interface JwtPayload {
    userId:string,
    email:string,
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
//in this file there helpful interfaces for enabling cookies