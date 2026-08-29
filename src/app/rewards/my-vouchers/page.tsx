import { redirect } from "next/navigation";

export default function MyVouchersRedirect() {
  redirect("/rewards/history");
}
