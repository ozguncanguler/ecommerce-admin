import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal, { SweetAlertResult } from "sweetalert2";
import { withSwal } from "react-sweetalert2";

interface Category {
  _id: string;
  name: string;
  parent?: {
    _id: string;
    name: string;
  };
  parentCategory?: string; // parentCategory eklendi
  properties: Array<{
    name: string;
    values: string[];
  }>;
}

interface Property {
  name: string;
  values: string;
}

interface CategoriesProps {
  swal: typeof Swal; // Swal'ın kendisini props olarak alıyoruz
}

function Categories({ swal }: CategoriesProps) {
  const [editedCategory, setEditedCategory] = useState<Category | null>(null);
  const [name, setName] = useState<string>("");
  const [parentCategory, setParentCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }

  async function saveCategory(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const data: Partial<Category> = {
      name,
      parentCategory, // parentCategory artık tanımlandı
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };

    if (editedCategory) {
      data._id = editedCategory._id; // _id sadece düzenleme sırasında eklenir
      await axios.put("/api/categories", data);
      setEditedCategory(null);
    } else {
      await axios.post("/api/categories", data);
    }

    setName("");
    setParentCategory("");
    setProperties([]);
    fetchCategories();
  }

  function editCategory(category: Category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id || "");
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
  }

  function deleteCategory(category: Category) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result: SweetAlertResult) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/categories?_id=" + _id);
          fetchCategories();
        }
      });
  }

  function addProperty() {
    setProperties((prev) => [...prev, { name: "", values: "" }]);
  }

  function handlePropertyNameChange(
    index: number,
    property: Property,
    newName: string
  ) {
    setProperties((prev) => {
      const updatedProperties = [...prev];
      updatedProperties[index].name = newName;
      return updatedProperties;
    });
  }

  function handlePropertyValuesChange(
    index: number,
    property: Property,
    newValues: string
  ) {
    setProperties((prev) => {
      const updatedProperties = [...prev];
      updatedProperties[index].values = newValues;
      return updatedProperties;
    });
  }

  function removeProperty(indexToRemove: number) {
    setProperties((prev) =>
      prev.filter((_, pIndex) => pIndex !== indexToRemove)
    );
  }

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "Create new category"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Category name"
            onChange={(ev) => setName(ev.target.value)}
            value={name}
          />
          <select
            onChange={(ev) => setParentCategory(ev.target.value)}
            value={parentCategory}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block">Properties</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2"
          >
            Add new property
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div key={index} className="flex gap-1 mb-2">
                <input
                  type="text"
                  value={property.name}
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyNameChange(index, property, ev.target.value)
                  }
                  placeholder="property name (example: color)"
                />
                <input
                  type="text"
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyValuesChange(index, property, ev.target.value)
                  }
                  value={property.values}
                  placeholder="values, comma separated"
                />
                <button
                  onClick={() => removeProperty(index)}
                  type="button"
                  className="btn-red"
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setParentCategory("");
                setProperties([]);
              }}
              className="btn-default"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary py-1">
            Save
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent category</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>
                  <td className="text-end">
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-default mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-red"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({}) => <Categories swal={Swal} />);
