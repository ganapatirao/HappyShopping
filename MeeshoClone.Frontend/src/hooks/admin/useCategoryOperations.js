import { useState } from 'react';
import { categoryAPI, subCategoryAPI } from '../../services/api';

export const useCategoryOperations = (loadDashboardData, validateForm, defaultValidationRules) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    displayName: '',
    icon: '',
    image: '',
    imageBase64: '',
    description: '',
    isFeatured: false,
    displayOrder: 0,
    isActive: true,
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        displayName: category.displayName,
        icon: category.icon,
        image: category.image,
        imageBase64: category.imageBase64 || '',
        description: category.description,
        isFeatured: category.isFeatured,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        displayName: '',
        icon: '',
        image: '',
        imageBase64: '',
        description: '',
        isFeatured: false,
        displayOrder: 0,
        isActive: true,
      });
    }
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      displayName: '',
      icon: '',
      image: '',
      description: '',
      isFeatured: false,
      displayOrder: 0,
      isActive: true,
    });
    setValidationErrors({});
  };

  const updateSubcategoriesOnCategoryChange = async (categoryId, newCategoryName) => {
    try {
      const subCategoriesRes = await subCategoryAPI.getByCategory(categoryId);
      if (subCategoriesRes.data.success && subCategoriesRes.data.subcategories) {
        for (const subCategory of subCategoriesRes.data.subcategories) {
          await subCategoryAPI.update(subCategory.id, {
            ...subCategory,
            categoryName: newCategoryName
          });
        }
      }
    } catch (error) {
      console.error('Error updating subcategories on category change:', error);
    }
  };

  const handleSaveCategory = async () => {
    const categoryRules = {
      name: { required: true, minLength: 2, maxLength: 50 },
      displayName: { required: true, minLength: 2, maxLength: 100 },
      icon: { required: true },
      description: { maxLength: 500 }
    };
    
    if (!validateForm(categoryForm, categoryRules)) {
      alert('Please fix the validation errors before saving');
      return;
    }
    
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, categoryForm);
        if (categoryForm.name !== editingCategory.name) {
          await updateSubcategoriesOnCategoryChange(editingCategory.id, categoryForm.name);
        }
      } else {
        await categoryAPI.create(categoryForm);
      }
      alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      handleCloseCategoryModal();
      loadDashboardData();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const handleDeleteCategory = (category) => {
    return {
      type: 'category',
      id: category.id,
      name: category.displayName || category.name
    };
  };

  return {
    showCategoryModal,
    editingCategory,
    categoryForm,
    setCategoryForm,
    validationErrors,
    setValidationErrors,
    handleOpenCategoryModal,
    handleCloseCategoryModal,
    handleSaveCategory,
    handleDeleteCategory
  };
};
