const API=(process.env.NEXT_PUBLIC_API_URL||"http://localhost:5000/api").replace(/\/$/,"");

async function request<T>(path:string):Promise<T>{const response=await fetch(API+path,{credentials:"include",cache:"no-store"});if(!response.ok)throw new Error("API request failed: "+response.status);const payload=await response.json();return (payload?.data??payload) as T;}

export const platformApi={products:()=>request<unknown[]>("/products"),categories:()=>request<unknown[]>("/categories"),lookbooks:()=>request<unknown[]>("/lookbooks"),account:()=>request<unknown>("/account/profile"),orders:()=>request<unknown[]>("/orders")};
