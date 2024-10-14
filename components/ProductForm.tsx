import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable, ItemInterface } from "react-sortablejs";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  properties: Array<{ name: string; values: string[] }>;
  parent?: Category;
}

interface ProductFormProps {
  _id?: string;
  title?: string;
  description?: string;
  price?: number;
  images?: string[];
  category?: string;
  properties?: { [key: string]: string };
}

interface ImageItem extends ItemInterface {
  id: string;
  src: string;
}

export default function ProductForm({
  _id,
  title: existingTitle = "",
  description: existingDescription = "",
  price: existingPrice = 0, // Varsayılan olarak sayı değeri tanımlandı
  images: existingImages = [],
  category: assignedCategory = "",
  properties: assignedProperties = {},
}: ProductFormProps) {
  const [title, setTitle] = useState(existingTitle);
  const [description, setDescription] = useState(existingDescription);
  const [category, setCategory] = useState(assignedCategory);
  const [productProperties, setProductProperties] =
    useState(assignedProperties);
  const [price, setPrice] = useState<number>(existingPrice); // Number olarak kullanılıyor
  const [images, setImages] = useState<ImageItem[]>(
    existingImages.map((image, index) => ({ id: index.toString(), src: image }))
  );
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  async function saveProduct(ev: React.FormEvent) {
    ev.preventDefault();
    const imageUrls = images.map((img) => img.src);
    const categoryValue = category || undefined;
    const data = {
      title,
      description,
      price,
      images: imageUrls,
      category: categoryValue,
      properties: productProperties,
    };
    if (_id) {
      await axios.put("/api/products", { ...data, _id });
    } else {
      await axios.post("/api/products", data);
    }
    setGoToProducts(true);
  }

  useEffect(() => {
    if (goToProducts) {
      router.push("/products");
    }
  }, [goToProducts, router]);

  async function uploadImages(ev: React.ChangeEvent<HTMLInputElement>) {
    const files = ev.target?.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      Array.from(files).forEach((file) => {
        data.append("file", file);
      });
      try {
        const res = await axios.post("/api/upload", data);
        setImages((oldImages) => [
          ...oldImages,
          ...res.data.links.map((link: string, index: number) => ({
            id: (oldImages.length + index).toString(),
            src: link,
          })),
        ]);
        setIsUploading(false);
      } catch (error) {
        console.error("Image upload failed:", error);
        setIsUploading(false);
      }
    }
  }

  function updateImagesOrder(newImages: ImageItem[]) {
    setImages(newImages);
  }

  function setProductProp(propName: string, value: string) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    if (catInfo) propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      if (parentCat) propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <label>Category</label>
      <select value={category} onChange={(ev) => setCategory(ev.target.value)}>
        <option value="">Uncategorized</option>
        {categories.length > 0 &&
          categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
      </select>
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div key={p.name} className="">
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <div>
              <select
                value={productProperties[p.name] || ""}
                onChange={(ev) => setProductProp(p.name, ev.target.value)}
              >
                {p.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((img) => (
              <div
                key={img.id}
                className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
              >
                <Image
                  src={img.src}
                  alt=""
                  className="rounded-lg object-contain"
                  width={96}
                  height={96}
                />
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Add image</div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>
      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
      />
      <label>Price (in USD)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(ev) => setPrice(parseFloat(ev.target.value))} // String'i number'a dönüştürüyoruz
      />
      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
}
