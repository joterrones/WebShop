import { NextFunction, Request, Response } from 'express';
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function requireAdmin(req: Request, _res: Response, next: NextFunction): void;
/** Autenticación + rol admin en un solo paso */
export declare const adminOnly: (typeof authenticate)[];
//# sourceMappingURL=auth.d.ts.map