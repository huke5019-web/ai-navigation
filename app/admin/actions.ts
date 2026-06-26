"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSession,destroyAdminSession,requireAdmin,verifyAdminCredentials } from "@/lib/auth";
import * as m from "@/lib/mutations";
import { loginSchema } from "@/lib/schemas";
export type ActionState={success?:boolean;error?:string;fieldErrors?:Record<string,string[]>};export type LoginActionState={error?:string};
const obj=(fd:FormData)=>Object.fromEntries(fd.entries());
function fail(e:unknown):ActionState{if(e&&typeof e==="object"&&"fieldErrors"in e)return{fieldErrors:(e as {fieldErrors:Record<string,string[]>}).fieldErrors};return{error:e instanceof Error?e.message:"操作失败"}}
async function run(fn:()=>Promise<unknown>,paths:string[]){await requireAdmin();try{await fn();for(const path of paths)revalidatePath(path);return{success:true}}catch(e){return fail(e)}}
export async function loginAction(_:LoginActionState,fd:FormData):Promise<LoginActionState>{const r=loginSchema.safeParse(obj(fd));if(!r.success||!await verifyAdminCredentials(r.data.username,r.data.password))return{error:"账号或密码错误"};await createAdminSession();redirect("/admin")}
export async function logoutAction():Promise<never>{await destroyAdminSession();redirect("/admin/login")}
export async function createCategoryAction(_:ActionState,fd:FormData){return run(()=>m.createCategory(obj(fd)),["/","/admin/categories"])}
export async function updateCategoryAction(id:number,_:ActionState,fd:FormData){return run(()=>m.updateCategory(id,obj(fd)),["/","/admin/categories"])}
export async function deleteCategoryAction(id:number){return run(()=>m.deleteCategory(id),["/","/admin/categories"])}
export async function createToolAction(_:ActionState,fd:FormData){return run(()=>m.createTool(obj(fd)),["/","/admin/tools","/sitemap.xml"])}
export async function updateToolAction(id:number,_:ActionState,fd:FormData){return run(()=>m.updateTool(id,obj(fd)),["/","/admin/tools","/sitemap.xml"])}
export async function deleteToolAction(id:number){return run(()=>m.deleteTool(id),["/","/admin/tools","/sitemap.xml"])}
export async function createAdvertisementAction(_:ActionState,fd:FormData){return run(()=>m.createAdvertisement(obj(fd)),["/","/admin/ads"])}
export async function updateAdvertisementAction(id:number,_:ActionState,fd:FormData){return run(()=>m.updateAdvertisement(id,obj(fd)),["/","/admin/ads"])}
export async function deleteAdvertisementAction(id:number){return run(()=>m.deleteAdvertisement(id),["/","/admin/ads"])}
export async function updateSiteSettingAction(_:ActionState,fd:FormData){return run(()=>m.updateSiteSetting(obj(fd)),["/","/admin/settings"])}
function assertSuccess(state:ActionState){if(!state.success){const message=state.error??Object.values(state.fieldErrors??{}).flat()[0]??"操作失败";throw new Error(message)}}
export async function createCategoryForm(fd:FormData){assertSuccess(await createCategoryAction({},fd))}export async function deleteCategoryForm(id:number){assertSuccess(await deleteCategoryAction(id))}
export async function createToolForm(fd:FormData){assertSuccess(await createToolAction({},fd))}export async function deleteToolForm(id:number){assertSuccess(await deleteToolAction(id))}
export async function createAdvertisementForm(fd:FormData){assertSuccess(await createAdvertisementAction({},fd))}export async function deleteAdvertisementForm(id:number){assertSuccess(await deleteAdvertisementAction(id))}
export async function updateSiteSettingForm(fd:FormData){assertSuccess(await updateSiteSettingAction({},fd))}
export async function updateCategoryForm(id:number,fd:FormData){assertSuccess(await updateCategoryAction(id,{},fd))}
export async function updateToolForm(id:number,fd:FormData){assertSuccess(await updateToolAction(id,{},fd))}
export async function updateAdvertisementForm(id:number,fd:FormData){assertSuccess(await updateAdvertisementAction(id,{},fd))}
