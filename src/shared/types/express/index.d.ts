import "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: "buyer" | "seller" | "admin";
            };
            body: any;
            cookies?: any;
            headers: any;
        }

        interface Response {
            status(code: number): this;
            json(body?: any): this;
        }
    }
}

declare module "express" {
    export interface NextFunction {
        (err?: any): void;
    }
}
