import { updateSiteSettingForm } from "@/app/admin/actions";
import { getSiteSetting } from "@/lib/queries";

export default async function SettingsPage() {
  const setting = await getSiteSetting();

  return (
    <>
      <h1>Settings</h1>
      <form className="admin-form" action={updateSiteSettingForm}>
        <label>
          Site name
          <input name="siteName" defaultValue={setting?.siteName ?? "AI Navigation"} required />
        </label>
        <label>
          Logo URL
          <input name="logoUrl" defaultValue={setting?.logoUrl ?? ""} />
        </label>
        <label className="wide">
          Site description
          <input
            name="siteDescription"
            defaultValue={setting?.siteDescription ?? ""}
            required
          />
        </label>
        <label className="wide">
          Footer text
          <input name="footerText" defaultValue={setting?.footerText ?? ""} required />
        </label>
        <button>Save settings</button>
      </form>
    </>
  );
}
