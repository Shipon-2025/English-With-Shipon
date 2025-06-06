
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Category, IconMap, IconName } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<Category>) => Promise<void>;
  category: Category | null; // null for new, Category object for edit
  allCategories: Category[];
  isLoading?: boolean;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  allCategories,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    order: 0,
    isPublished: false,
    iconName: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, ''); // Remove all non-word chars
  }, []);

  useEffect(() => {
    if (category) {
      setFormData({ ...category });
      setIsSlugManuallyEdited(true); // If editing, assume slug was set
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: null,
        order: 0,
        isPublished: false,
        iconName: undefined,
      });
      setIsSlugManuallyEdited(false);
    }
    setErrors({}); // Clear errors when modal opens or category changes
  }, [category, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | boolean | null | undefined = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = parseInt(value, 10) || 0;
    } else if (name === 'parentId' && value === "null") {
      processedValue = null;
    } else if (name === 'iconName' && value === "") {
      processedValue = undefined;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));

    if (name === 'name' && !isSlugManuallyEdited && !category?.id) { // Only auto-slug for new categories if slug not manually edited
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
    if (name === 'slug') {
        setIsSlugManuallyEdited(true);
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required.';
    if (!formData.slug?.trim()) newErrors.slug = 'Slug is required.';
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
        newErrors.slug = 'Slug must be lowercase alphanumeric with hyphens, no spaces or special characters.';
    }
    if (typeof formData.order !== 'number' || formData.order < 0) newErrors.order = 'Order must be a non-negative number.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSave(formData);
  };
  
  const availableParentCategories = allCategories.filter(cat => cat.id !== category?.id); // Prevent self-parenting
  const iconNames = Object.keys(IconMap) as IconName[];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add New Category'}
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {isLoading ? (category ? 'Saving...' : 'Creating...') : (category ? 'Save Changes' : 'Create Category')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Category Name"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          error={errors.name}
          required
          disabled={isLoading}
        />
        <Input
          label="Slug (URL-friendly)"
          id="slug"
          name="slug"
          value={formData.slug || ''}
          onChange={handleChange}
          error={errors.slug}
          required
          disabled={isLoading}
          onFocus={() => setIsSlugManuallyEdited(true)}
        />
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none ${errors.description ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
            disabled={isLoading}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
            Parent Category
          </label>
          <select
            id="parentId"
            name="parentId"
            value={formData.parentId === null ? "null" : formData.parentId || ""}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={isLoading}
          >
            <option value="null">-- None (Top Level) --</option>
            {availableParentCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <Input
          label="Order (display sort)"
          id="order"
          name="order"
          type="number"
          min="0"
          value={formData.order !== undefined ? String(formData.order) : '0'}
          onChange={handleChange}
          error={errors.order}
          disabled={isLoading}
        />
         <div>
          <label htmlFor="iconName" className="block text-sm font-medium text-gray-700 mb-1">
            Icon
          </label>
          <select
            id="iconName"
            name="iconName"
            value={formData.iconName || ""}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={isLoading}
          >
            <option value="">-- Select Icon --</option>
            {iconNames.map(iconKey => (
              <option key={iconKey} value={iconKey}>{iconKey.replace(/([A-Z])/g, ' $1').trim()}</option> 
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <input
            id="isPublished"
            name="isPublished"
            type="checkbox"
            checked={formData.isPublished || false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
          />
          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
            Published
          </label>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;
