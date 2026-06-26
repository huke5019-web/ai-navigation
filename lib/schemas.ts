import { z } from "zod";
const text=z.string().trim().min(1), slug=text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), integer=z.coerce.number().int();
const checkbox=z.union([z.boolean(),z.literal("on"),z.literal("true"),z.literal("1")]).optional().transform(v=>v===true||v==="on"||v==="true"||v==="1");
const httpUrl=z.string().trim().url().refine(v=>["http:","https:"].includes(new URL(v).protocol),"仅支持 HTTP(S) 链接");
const optionalUrl=z.string().trim().optional().transform(v=>v||undefined).pipe(httpUrl.optional());
function validDate(v:string){const m=/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(v);if(!m)return false;const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));return d.getUTCFullYear()===+m[1]&&d.getUTCMonth()===+m[2]-1&&d.getUTCDate()===+m[3]&&!Number.isNaN(new Date(v).getTime());}
const optionalDate=z.string().trim().optional().refine(v=>!v||validDate(v),"日期格式无效").transform(v=>v?new Date(v):null);
export const loginSchema=z.object({username:text,password:z.string().min(1)});
export const categorySchema=z.object({name:text,slug,icon:text.default("Sparkles"),sortOrder:integer.default(0),isActive:checkbox});
export const toolSchema=z.object({categoryId:z.coerce.number().int().positive(),name:text,slug,logoUrl:optionalUrl,summary:text,description:text,websiteUrl:httpUrl,tags:z.string().trim().optional().default(""),sortOrder:integer.default(0),isActive:checkbox,isFeatured:checkbox});
export const adSchema=z.object({title:text,imageUrl:httpUrl,targetUrl:httpUrl,placement:z.enum(["HOME_BANNER","HOME_SIDEBAR","TOOL_DETAIL"]),startsAt:optionalDate,endsAt:optionalDate,sortOrder:integer.default(0),isActive:checkbox}).refine(({startsAt,endsAt})=>!startsAt||!endsAt||startsAt<=endsAt,{message:"结束时间不能早于开始时间",path:["endsAt"]});
export const settingsSchema=z.object({siteName:text,siteDescription:text,logoUrl:optionalUrl,footerText:text});
