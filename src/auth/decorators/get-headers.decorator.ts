import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    console.log(req);
    const headers = req.rawHeaders;

    if(!headers)
    throw new InternalServerErrorException('Headers not found');

    return headers;
  }
);