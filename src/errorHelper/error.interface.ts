export interface TErrorSoures {
    path: string;
    message: string
}

export interface TErroResponse {
    statusCode?: number;
    success: boolean;
    message: string;
    errorSoures: TErrorSoures[];
    stack?: string | undefined; 
    error?: unknown
}