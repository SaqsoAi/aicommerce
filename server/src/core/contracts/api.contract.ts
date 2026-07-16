export type ApiSuccess<T>={success:true;data:T;meta?:Record<string,unknown>;requestId?:string};
export type ApiFailure={success:false;error:{code:string;message:string;details?:unknown};requestId?:string};
export function ok<T>(data:T,meta?:Record<string,unknown>):ApiSuccess<T>{return {success:true,data,...(meta?{meta}:{})};}
export function fail(code:string,message:string,details?:unknown):ApiFailure{return {success:false,error:{code,message,...(details===undefined?{}:{details})}};}
