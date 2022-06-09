import { API_URL } from "./login";

export const importProducts = async (products, company_id, token) => {
  const existStores = await fetch(
    API_URL + `/shopify-stores?filter={"company_id": "1"}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  ).then((x) => x.json());
  if (existStores.length) {
    const store = existStores[0];
    const updateRes = await fetch(API_URL + "/shopify-stores/" + store.id, {
      method: "PUT",
      body: JSON.stringify({ products, company_id }),
      headers: { Authorization: `Bearer ${token}` },
    }).then((x) => x.json());
    console.log({ updateRes });
  } else {
    const createRes = await fetch(API_URL + "/shopify-stores", {
      method: "POST",
      body: JSON.stringify({ products, company_id }),
      headers: { Authorization: `Bearer ${token}` },
    }).then((x) => x.json());
    console.log({ createRes });
  }
};
