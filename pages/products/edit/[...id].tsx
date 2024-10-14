import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductForm from "@/components/ProductForm";

// Product interface tanımlaması
interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  properties: Record<string, string>;
}

export default function EditProductPage() {
  const [productInfo, setProductInfo] = useState<Product | null>(null); // Tipini Product veya null olarak belirledim
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) {
      return;
    }
    const fetchProductInfo = async () => {
      const response = await axios.get(`/api/products?id=${id}`);
      setProductInfo(response.data);
    };
    fetchProductInfo();
  }, [id, setProductInfo]);

  return (
    <Layout>
      <h1>Edit product</h1>
      {productInfo && (
        <ProductForm {...productInfo} price={productInfo.price} />
      )}
    </Layout>
  );
}
