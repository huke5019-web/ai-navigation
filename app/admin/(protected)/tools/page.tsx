import type { Prisma } from "@prisma/client";
import { createToolForm, deleteToolForm, updateToolForm } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

type ToolRow = Prisma.ToolGetPayload<{ include: { category: true; tags: { include: { tag: true } } } }>;

function Fields({ categories, tool }: { categories: { id: number; name: string }[]; tool?: ToolRow }) {
  return <>
    <label>名称<input name="name" defaultValue={tool?.name} required /></label>
    <label>Slug<input name="slug" defaultValue={tool?.slug} required /></label>
    <label>分类<select name="categoryId" defaultValue={tool?.categoryId}>{categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
    <label>Logo URL<input name="logoUrl" defaultValue={tool?.logoUrl ?? ""} /></label>
    <label className="wide">简介<input name="summary" defaultValue={tool?.summary} required /></label>
    <label className="wide">详细描述<textarea name="description" defaultValue={tool?.description} required /></label>
    <label>官网 URL<input name="websiteUrl" type="url" defaultValue={tool?.websiteUrl} required /></label>
    <label>标签<input name="tags" defaultValue={tool?.tags.map(x => x.tag.name).join(", ")} /></label>
    <label>排序<input name="sortOrder" type="number" defaultValue={tool?.sortOrder ?? 0} /></label>
    <label><input name="isActive" type="checkbox" defaultChecked={tool?.isActive ?? true} />启用</label>
    <label><input name="isFeatured" type="checkbox" defaultChecked={tool?.isFeatured} />精选</label>
  </>;
}

export default async function Page() {
  const [categories, tools] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.tool.findMany({ include: { category: true, tags: { include: { tag: true } } }, orderBy: { sortOrder: "asc" } }),
  ]);
  return <><h1>工具管理</h1>
    <form className="admin-form" action={createToolForm}><Fields categories={categories} /><button>新增工具</button></form>
    <div className="admin-list">{tools.map(tool => <div className="admin-card" key={tool.id}><b>{tool.name}</b> · {tool.category.name}
      <details><summary>编辑</summary><form className="admin-form" action={updateToolForm.bind(null, tool.id)}><Fields categories={categories} tool={tool} /><button>保存</button></form></details>
      <form action={deleteToolForm.bind(null, tool.id)}><button className="danger">删除</button></form>
    </div>)}</div>
  </>;
}
