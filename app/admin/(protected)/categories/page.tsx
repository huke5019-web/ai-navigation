import {
  createCategoryForm,
  deleteCategoryForm,
  updateCategoryForm,
} from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const rows = await prisma.category.findMany({
    include: { _count: { select: { tools: true } } },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  return (
    <>
      <h1>Categories</h1>
      <form className="admin-form" action={createCategoryForm}>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Slug
          <input name="slug" required />
        </label>
        <label>
          Icon
          <input name="icon" defaultValue="Sparkles" />
        </label>
        <label>
          Sort Order
          <input name="sortOrder" type="number" defaultValue="0" />
        </label>
        <label>
          <input name="isActive" type="checkbox" defaultChecked /> Active
        </label>
        <button>Add category</button>
      </form>

      <div className="admin-list">
        {rows.map((row) => (
          <div className="admin-card" key={row.id}>
            <b>{row.name}</b> <span>{row._count.tools} tools</span>
            <details>
              <summary>Edit</summary>
              <form className="admin-form" action={updateCategoryForm.bind(null, row.id)}>
                <label>
                  Name
                  <input name="name" defaultValue={row.name} />
                </label>
                <label>
                  Slug
                  <input name="slug" defaultValue={row.slug} />
                </label>
                <label>
                  Icon
                  <input name="icon" defaultValue={row.icon} />
                </label>
                <label>
                  Sort Order
                  <input name="sortOrder" type="number" defaultValue={row.sortOrder} />
                </label>
                <label>
                  <input name="isActive" type="checkbox" defaultChecked={row.isActive} /> Active
                </label>
                <button>Save</button>
              </form>
            </details>
            <form action={deleteCategoryForm.bind(null, row.id)}>
              <button className="danger">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
