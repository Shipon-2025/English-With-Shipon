import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { Category, Lesson, IconMap } from '../../types';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon, CollectionIcon } from '../../components/icons/HeroIcons'; // Added CollectionIcon
import CategoryFormModal from './CategoryFormModal';

export default function AdminManageContentPage(): React.ReactElement {
  const { contentType } = useParams<{ contentType: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<(Category | Lesson)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | Lesson | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentCategoryForEdit, setCurrentCategoryForEdit] = useState<Category | null>(null);
  const [allCategoriesForForm, setAllCategoriesForForm] = useState<Category[]>([]);


  const pageTitle = contentType ? contentType.charAt(0).toUpperCase() + contentType.slice(1) : 'Content';
  const managingCategories = contentType === 'categories';

  const fetchAllCategoriesForForm = useCallback(async () => {
    // This function is specifically for the form's parent dropdown,
    // so it always fetches all categories regardless of the current `contentType`.
    try {
      const categories = await contentService.getCategories();
      setAllCategoriesForForm(categories);
    } catch (catErr) {
      console.error("Failed to fetch all categories for form dropdown:", catErr);
      // Handle error for dropdown loading if necessary, e.g., show a message in the modal
    }
  }, []);


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (managingCategories) {
        const categories = await contentService.getCategories();
        setItems(categories);
        setAllCategoriesForForm(categories); // Also update for form if viewing categories
      } else if (contentType) { 
        const category = await contentService.getCategoryBySlug(contentType);
        if (category) {
          const lessons = await contentService.getLessonsByCategoryId(category.id);
          setItems(lessons);
        } else {
          setError(`Category "${contentType}" not found. Cannot load lessons.`);
          setItems([]);
        }
        // Still fetch all categories for the form if a category modal might be opened from a lessons page (though less common)
        // For now, let's assume CategoryFormModal is primarily used from the 'categories' contentType page.
        // If we needed to edit a category related to a lesson from here, we'd call fetchAllCategoriesForForm.
      } else {
        setError("Content type not specified.");
        setItems([]);
      }
    } catch (err) {
      console.error(`Failed to fetch ${pageTitle}:`, err);
      setError(`Failed to load ${pageTitle.toLowerCase()}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [contentType, pageTitle, managingCategories]);

  useEffect(() => {
    fetchData();
    if (managingCategories) { // Always ensure all categories are available for the form when on the categories page
        fetchAllCategoriesForForm();
    }
  }, [fetchData, managingCategories, fetchAllCategoriesForForm]);

  const handleAddNew = () => {
    if (managingCategories) {
        setCurrentCategoryForEdit(null); // For creating a new category
        setIsCategoryModalOpen(true);
        if (allCategoriesForForm.length === 0) fetchAllCategoriesForForm(); // Ensure categories are loaded for dropdown
    } else if (contentType) { 
        navigate(`/admin/manage/${contentType}/new`);
    } else {
        alert("Cannot add new item: Content type is not specified correctly.");
    }
  };

  const handleEdit = (item: Category | Lesson) => {
    if ('title' in item) { // item is Lesson
      if (contentType) { 
        navigate(`/admin/manage/${contentType}/edit/${item.id}`);
      } else {
        console.error("Attempting to edit a lesson but contentType is undefined for routing.", item);
        alert("Cannot edit lesson: category context for URL is missing.");
      }
    } else { // item is Category
      setCurrentCategoryForEdit(item as Category);
      setIsCategoryModalOpen(true);
      if (allCategoriesForForm.length === 0) fetchAllCategoriesForForm(); // Ensure categories are loaded for dropdown
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    setLoading(true); 
    try {
      if (categoryData.id) { 
        await contentService.updateCategory(categoryData.id, categoryData);
      } else { 
        const { id, ...newCategoryData } = categoryData; 
        if (!newCategoryData.name || !newCategoryData.slug) {
            throw new Error("Name and Slug are required for a new category.");
        }
        const categoryToCreate: Omit<Category, 'id'> = {
            name: newCategoryData.name,
            slug: newCategoryData.slug,
            description: newCategoryData.description || '',
            parentId: newCategoryData.parentId === "null" ? null : newCategoryData.parentId, // Handle "null" string
            order: newCategoryData.order || 0,
            isPublished: newCategoryData.isPublished || false,
            iconName: newCategoryData.iconName || undefined,
        };
        await contentService.createCategory(categoryToCreate);
      }
      setIsCategoryModalOpen(false);
      fetchData(); // Refresh list
      if (managingCategories) fetchAllCategoriesForForm(); // Refresh for form dropdown as well
    } catch (err) {
      console.error("Failed to save category:", err);
      setError(`Failed to save category. ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (item: Category | Lesson) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setLoading(true); 
    try {
      if (managingCategories) {
        await contentService.deleteCategory(itemToDelete.id);
      } else {
        await contentService.deleteLesson(itemToDelete.id);
      }
      fetchData(); 
       if (managingCategories) fetchAllCategoriesForForm(); // Refresh for form dropdown
    } catch (err) {
        console.error("Deletion failed:", err);
        setError(`Failed to delete item. ${(err as Error).message}`);
    } finally {
        setShowDeleteModal(false);
        setItemToDelete(null);
        setLoading(false); 
    }
  };

  const renderItemRow = (item: Category | Lesson, index: number) => {
    const isLesson = 'title' in item;
    const titleOrName = isLesson ? (item as Lesson).title : (item as Category).name;
    
    let statusDisplay;
    if (isLesson) {
       statusDisplay = (item as Lesson).isPublished ? 
           <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Published</span> : 
           <span className="px-2 py-0.5 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Draft</span>;
    } else { 
       statusDisplay = (item as Category).isPublished ?
           <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Published</span> :
           <span className="px-2 py-0.5 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Draft</span>;
    }

    return (
      <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{titleOrName}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{statusDisplay}</td>
        {isLesson ? (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{(item as Lesson).type}</td>
        ) : (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(item as Category).slug}</td>
          </>
        )}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          {isLesson && contentType && item.slug && (
             <Link 
                to={ `/dashboard/category/${contentType}/lesson/${item.slug}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 hover:text-indigo-800 inline-flex items-center p-1 rounded hover:bg-indigo-100 transition-colors" 
                title="View Lesson"
              >
                <EyeIcon className="h-5 w-5" />
             </Link>
          )}
          <button 
            onClick={() => handleEdit(item)} 
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors" 
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={() => openDeleteModal(item)} 
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors" 
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </td>
      </tr>
    );
  };


  if (loading && items.length === 0) return <LoadingSpinner text={`Loading ${pageTitle.toLowerCase()}...`} className="mt-10"/>;
  
  if (error && items.length === 0 && !isCategoryModalOpen) { 
    return (
        <div className="bg-red-50 text-red-700 p-4 rounded-md shadow">
            <h2 className="font-semibold text-lg">Error Loading Content</h2>
            <p>{error}</p>
            <Button onClick={fetchData} className="mt-2" variant="secondary">Try Again</Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage {pageTitle}</h1>
        <Button onClick={handleAddNew} variant="primary" size="md" disabled={!contentType && !managingCategories}>
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Add New {managingCategories ? 'Category' : 'Lesson'}
        </Button>
      </div>

      {error && !isCategoryModalOpen && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}


      {!loading && items.length === 0 && !error && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No {pageTitle.toLowerCase()} found.</h3>
            <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new {managingCategories ? 'category' : 'lesson'}.
            </p>
            {(contentType || managingCategories) && (
                 <div className="mt-6">
                    <Button onClick={handleAddNew} variant="primary">
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Add New {managingCategories ? 'Category' : 'Lesson'}
                    </Button>
                </div>
            )}
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {managingCategories ? 'Name' : 'Title'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {managingCategories ? 'Slug' : 'Type'}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => renderItemRow(item, index))}
            </tbody>
          </table>
        </div>
      )}
      {loading && items.length > 0 && <LoadingSpinner text="Updating list..." className="py-4" size="sm"/>}

      {managingCategories && (
        <CategoryFormModal
            isOpen={isCategoryModalOpen}
            onClose={() => {
                setIsCategoryModalOpen(false);
                setCurrentCategoryForEdit(null);
                setError(null); 
            }}
            onSave={handleSaveCategory}
            category={currentCategoryForEdit}
            allCategories={allCategoriesForForm}
            isLoading={loading && isCategoryModalOpen} // Pass loading state specifically for modal operations
        />
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={`Confirm Delete ${managingCategories ? 'Category' : 'Lesson'}`}
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={loading && showDeleteModal}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to delete "<strong>{itemToDelete ? ('title' in itemToDelete ? itemToDelete.title : (itemToDelete as Category).name) : ''}</strong>"?
        </p>
        <p className="text-xs text-red-600 mt-2">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}