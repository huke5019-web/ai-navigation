import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adSchema, categorySchema, settingsSchema, toolSchema } from "@/lib/schemas";
type Input=Record<string,unknown>;
function parse<T>(schema:z.ZodType<T>,input:Input):T{const r=schema.safeParse(input);if(!r.success)throw r.error.flatten();return r.data;}
const slugify=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
export const createCategory=(input:Input)=>prisma.category.create({data:parse(categorySchema,input)});
export const updateCategory=(id:number,input:Input)=>prisma.category.update({where:{id},data:parse(categorySchema,input)});
export async function deleteCategory(id:number){if(await prisma.tool.count({where:{categoryId:id}}))throw new Error("请先转移或删除该分类下的工具");return prisma.category.delete({where:{id}});}
async function saveTool(id:number|null,input:Input){
  const data=parse(toolSchema,input), tagMap=new Map<string,string>();
  for(const name of data.tags.split(",").map(n=>n.trim()).filter(Boolean)){const key=slugify(name);if(!tagMap.has(key))tagMap.set(key,name);}
  try{return await prisma.$transaction(async tx=>{
    const records=[];for(const [tagSlug,name] of tagMap)records.push(await tx.tag.upsert({where:{slug:tagSlug},update:{},create:{slug:tagSlug,name}}));
    const payload={categoryId:data.categoryId,name:data.name,slug:data.slug,logoUrl:data.logoUrl??null,summary:data.summary,description:data.description,websiteUrl:data.websiteUrl,sortOrder:data.sortOrder,isActive:data.isActive,isFeatured:data.isFeatured};
    const tool=id?await tx.tool.update({where:{id},data:payload}):await tx.tool.create({data:payload});
    await tx.toolTag.deleteMany({where:{toolId:tool.id}});if(records.length)await tx.toolTag.createMany({data:records.map(t=>({toolId:tool.id,tagId:t.id}))});return tool;
  });}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2002")throw{formErrors:[],fieldErrors:{slug:["Slug 已存在"]}};throw e;}
}
export const createTool=(i:Input)=>saveTool(null,i);export const updateTool=(id:number,i:Input)=>saveTool(id,i);export const deleteTool=(id:number)=>prisma.tool.delete({where:{id}});
export async function createAdvertisement(i:Input){return prisma.advertisement.create({data:parse(adSchema,i)});}
export async function updateAdvertisement(id:number,i:Input){return prisma.advertisement.update({where:{id},data:parse(adSchema,i)});}
export const deleteAdvertisement=(id:number)=>prisma.advertisement.delete({where:{id}});
export async function updateSiteSetting(i:Input){const d=parse(settingsSchema,i);return prisma.siteSetting.upsert({where:{id:1},update:{...d,logoUrl:d.logoUrl??null},create:{id:1,...d,logoUrl:d.logoUrl??null}});}
