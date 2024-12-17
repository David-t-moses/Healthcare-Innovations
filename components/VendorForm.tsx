"use client";

import { createVendor } from "@/lib/actions/vendor.actions";

export default function VendorForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    await createVendor({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" placeholder="Vendor Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="phone" placeholder="Phone" required />
      <textarea name="address" placeholder="Address" required />
      <button type="submit">Add Vendor</button>
    </form>
  );
}
