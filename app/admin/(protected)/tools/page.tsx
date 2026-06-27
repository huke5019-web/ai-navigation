import { Prisma } from "@prisma/client";

import { createToolForm, deleteToolForm, updateToolForm } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";
import { getActiveCategories, getTools } from "@/lib/queries";

type ToolRow = Prisma.ToolGetPayload<{
  include: { category: true; tags: { include: { tag: true } } };
}>;

function Fields({
  categories,
  tool,
}: {
  categories: { id: number; name: string }[];
  tool?: ToolRow;
}) {
  return (
    <>
      <label>
        Name
        <input name="name" defaultValue={tool?.name} required />
      </label>
      <label>
        Slug
        <input name="slug" defaultValue={tool?.slug} required />
      </label>
      <label>
        Category
        <select name="categoryId" defaultValue={tool?.categoryId}>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Logo URL
        <input name="logoUrl" defaultValue={tool?.logoUrl ?? ""} />
      </label>
      <label className="wide">
        Summary
        <input name="summary" defaultValue={tool?.summary} required />
      </label>
      <label className="wide">
        Description
        <textarea name="description" defaultValue={tool?.description} required />
      </label>
      <label>
        Legacy Website URL
        <input name="websiteUrl" type="url" defaultValue={tool?.websiteUrl} required />
      </label>
      <label>
        Official URL
        <input
          name="officialUrl"
          type="url"
          defaultValue={tool?.officialUrl ?? tool?.websiteUrl ?? ""}
        />
      </label>
      <label>
        Affiliate URL
        <input name="affiliateUrl" type="url" defaultValue={tool?.affiliateUrl ?? ""} />
      </label>
      <label>
        Sponsor Label
        <input name="sponsorLabel" defaultValue={tool?.sponsorLabel ?? ""} />
      </label>
      <label>
        Coupon Code
        <input name="couponCode" defaultValue={tool?.couponCode ?? ""} />
      </label>
      <label>
        Pricing
        <input name="pricing" defaultValue={tool?.pricing ?? ""} />
      </label>
      <label>
        Tags
        <input name="tags" defaultValue={tool?.tags.map((item) => item.tag.name).join(", ")} />
      </label>
      <label>
        Sort Order
        <input name="sortOrder" type="number" defaultValue={tool?.sortOrder ?? 0} />
      </label>
      <label>
        <input name="isActive" type="checkbox" defaultChecked={tool?.isActive ?? true} />
        Active
      </label>
      <label>
        <input name="isFeatured" type="checkbox" defaultChecked={tool?.isFeatured} />
        Featured
      </label>
      <label>
        <input name="isSponsored" type="checkbox" defaultChecked={tool?.isSponsored} />
        Sponsored
      </label>
    </>
  );
}

export default async function Page() {
  let categories: { id: number; name: string }[] = [];
  let tools: ToolRow[] = [];

  try {
    [categories, tools] = await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.tool.findMany({
        include: { category: true, tags: { include: { tag: true } } },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      !["P2021", "P2022"].includes(error.code)
    ) {
      throw error;
    }

    [categories, tools] = await Promise.all([
      getActiveCategories(),
      getTools(),
    ]);
  }

  return (
    <>
      <h1>Tool Management</h1>
      <form className="admin-form" action={createToolForm}>
        <Fields categories={categories} />
        <button>Add Tool</button>
      </form>
      <div className="admin-list">
        {tools.map((tool) => (
          <div className="admin-card" key={tool.id}>
            <b>{tool.name}</b> · {tool.category.name}
            <details>
              <summary>Edit</summary>
              <form className="admin-form" action={updateToolForm.bind(null, tool.id)}>
                <Fields categories={categories} tool={tool} />
                <button>Save</button>
              </form>
            </details>
            <form action={deleteToolForm.bind(null, tool.id)}>
              <button className="danger">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
