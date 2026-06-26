import type { Advertisement } from "@prisma/client";
import { createAdvertisementForm, deleteAdvertisementForm, updateAdvertisementForm } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

function Fields({ ad }: { ad?: Advertisement }) {
  return <>
    <label>标题<input name="title" defaultValue={ad?.title} required /></label>
    <label>位置<select name="placement" defaultValue={ad?.placement}><option>HOME_BANNER</option><option>HOME_SIDEBAR</option><option>TOOL_DETAIL</option></select></label>
    <label>图片 URL<input name="imageUrl" type="url" defaultValue={ad?.imageUrl} required /></label>
    <label>跳转 URL<input name="targetUrl" type="url" defaultValue={ad?.targetUrl} required /></label>
    <label>开始时间<input name="startsAt" type="datetime-local" defaultValue={ad?.startsAt?.toISOString().slice(0, 16)} /></label>
    <label>结束时间<input name="endsAt" type="datetime-local" defaultValue={ad?.endsAt?.toISOString().slice(0, 16)} /></label>
    <label>排序<input name="sortOrder" type="number" defaultValue={ad?.sortOrder ?? 0} /></label>
    <label><input name="isActive" type="checkbox" defaultChecked={ad?.isActive ?? true} />启用</label>
  </>;
}

export default async function Page() {
  const ads = await prisma.advertisement.findMany({ orderBy: { sortOrder: "asc" } });
  return <><h1>广告管理</h1>
    <form className="admin-form" action={createAdvertisementForm}><Fields /><button>新增广告</button></form>
    <div className="admin-list">{ads.map(ad => <div className="admin-card" key={ad.id}><b>{ad.title}</b> · {ad.placement}
      <details><summary>编辑</summary><form className="admin-form" action={updateAdvertisementForm.bind(null, ad.id)}><Fields ad={ad} /><button>保存</button></form></details>
      <form action={deleteAdvertisementForm.bind(null, ad.id)}><button className="danger">删除</button></form>
    </div>)}</div>
  </>;
}
