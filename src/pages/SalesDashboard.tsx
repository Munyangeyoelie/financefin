import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Category = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Fetch categories from Supabase when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  // Handle changes in form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission to add a new category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("categories")
      .insert([formData])
      .select();
    if (error) {
      console.error("Error adding category:", error);
    } else {
      setCategories([...categories, data[0]]);
      setFormData({ name: "", description: "" }); // Reset form
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Category List
      </h1>

      {/* Display list of categories */}
      <div>
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <h3 className="text-lg font-medium">{category.name}</h3>
            <p className="text-gray-600">
              {category.description || "No description"}
            </p>
          </div>
        ))}
      </div>

      {/* Form to add a new category */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Add Category
        </button>
      </form>
    </div>
  );
};

export default CategoryList;
