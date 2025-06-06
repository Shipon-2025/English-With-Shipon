
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { Lesson, Category } from '../../types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import RichTextEditorPlaceholder from '../../components/RichTextEditorPlaceholder';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminLessonEditorPage: React.FC = () => {
  const { contentType, lessonId } = useParams<{ contentType: string; lessonId?: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Partial<Lesson>>({
    title: '',
    slug: '',
    content: '',
    categoryPath: contentType ? [contentType] : [],
    mainCategoryId: '', 
    type: 'text',
    isPublished: false,
    order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNewLesson = !lessonId;
  const pageTitleSuffix = contentType ? contentType.charAt(0).toUpperCase() + contentType.slice(1) : 'Content';
  const pageTitle = isNewLesson ? `Create New ${pageTitleSuffix} Lesson` : `Edit ${pageTitleSuffix} Lesson`;

  const fetchLessonData = useCallback(async () => {
    if (lessonId) {
      setLoading(true);
      setError(null);
      try {
        const fetchedLesson = await contentService.getLessonById(lessonId);
        if (fetchedLesson) {
          setLesson(fetchedLesson);
        } else {
          setError('Lesson not found.');
        }
      } catch (err) {
        console.error('Failed to fetch lesson:', err);
        setError('Failed to load lesson data.');
      } finally {
        setLoading(false);
      }
    }
  }, [lessonId]);

  const fetchCategoryContext = useCallback(async () => {
    if (contentType) {
        setLoading(true);
        try {
            const mainCategory = await contentService.getCategoryBySlug(contentType);
            if (mainCategory) {
                setLesson(prev => ({ 
                    ...prev, 
                    mainCategoryId: mainCategory.id, 
                    categoryPath: prev.categoryPath && prev.categoryPath.length > 0 ? prev.categoryPath : [mainCategory.slug] 
                }));
            } else {
                setError(`Category "${contentType}" not found. Cannot set context for new lesson.`);
                // If creating new lesson and category not found, it's a problem
                if (isNewLesson) navigate('/admin/dashboard'); 
            }
        } catch (err) {
            console.error("Failed to fetch category data:", err);
            setError(`Failed to load category data for ${contentType}.`);
            if (isNewLesson) navigate('/admin/dashboard');
        } finally {
            setLoading(false) // Potentially conflicts with fetchLessonData's setLoading
        }
    } else if (isNewLesson) {
        setError("Content type (category) is missing in URL. Cannot create new lesson.");
        navigate('/admin/dashboard');
    }
  }, [contentType, navigate, isNewLesson]);


  useEffect(() => {
    document.title = pageTitle;
    // Fetch category context first, especially for new lessons to set mainCategoryId
    fetchCategoryContext().then(() => {
        if (!isNewLesson) {
          fetchLessonData();
        }
    });
  }, [pageTitle, isNewLesson, fetchLessonData, fetchCategoryContext]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
         setLesson(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
        setLesson(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    }
    else {
         setLesson(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'title' && isNewLesson) { // Only auto-slug for new lessons or if slug is empty
        setLesson(prev => ({ ...prev, slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    }
  };

  const handleContentChange = (contentValue: string) => {
    setLesson(prev => ({ ...prev, content: contentValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson.title || !lesson.slug || !lesson.mainCategoryId) {
        setError("Title, Slug, and Main Category association are required.");
        return;
    }
    setSaving(true);
    setError(null);
    try {
        // Ensure all required fields for a Lesson are present
        const lessonDataToSave: Lesson = {
            id: lessonId || '', // Placeholder for new lesson, will be overridden by service
            title: lesson.title!,
            slug: lesson.slug!,
            content: lesson.content!,
            categoryPath: lesson.categoryPath || (contentType ? [contentType] : []),
            mainCategoryId: lesson.mainCategoryId!,
            subCategoryId: lesson.subCategoryId,
            type: lesson.type || 'text',
            mediaUrl: lesson.mediaUrl,
            order: lesson.order || 0,
            isPublished: lesson.isPublished || false,
            views: lesson.views || 0,
        };


        if (isNewLesson) {
            // Create a version without 'id' for creation
            const { id, ...creatableLessonData } = lessonDataToSave;
            await contentService.createLesson(creatableLessonData);
        } else {
            await contentService.updateLesson(lessonId!, lessonDataToSave);
        }
        navigate(`/admin/manage/${contentType}`);
    } catch (err) {
        console.error('Failed to save lesson:', err);
        setError(`Failed to save lesson. ${(err as Error).message || 'Please try again.'}`);
    } finally {
        setSaving(false);
    }
  };

  if (loading && !saving) { // Show loading spinner only if not in saving state
    return <LoadingSpinner text="Loading lesson editor..." className="mt-10" />;
  }
  
  // If essential context like mainCategoryId is missing for a new lesson after attempting to fetchCategoryContext
  if (isNewLesson && !lesson.mainCategoryId && !loading && contentType) {
      return (
          <div className="text-red-500 p-4 bg-red-100 rounded-md">
              Error: Could not determine the category context for this new lesson.
              This might be due to an invalid category slug '{contentType}' in the URL.
              <Button onClick={() => navigate('/admin/dashboard')} variant="secondary" className="mt-2 ml-2">
                  Go to Admin Dashboard
              </Button>
          </div>
      );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{pageTitle}</h1>
        <Button onClick={() => navigate(`/admin/manage/${contentType}`)} variant="ghost">
          Back to List
        </Button>
      </div>

      {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-6">
        <Input
          label="Lesson Title"
          id="title"
          name="title"
          value={lesson.title || ''}
          onChange={handleChange}
          required
          placeholder="e.g., Introduction to Present Simple"
          maxLength={150}
        />
        <Input
          label="Slug (URL-friendly)"
          id="slug"
          name="slug"
          value={lesson.slug || ''}
          onChange={handleChange}
          required
          placeholder="e.g., intro-present-simple (auto-generated if new)"
          maxLength={100}
        />
        
        <div>
            <label htmlFor="mainCategoryDisplay" className="block text-sm font-medium text-gray-700 mb-1">Main Category Context</label>
            <Input
                id="mainCategoryDisplay"
                name="mainCategoryDisplay"
                value={contentType || 'Error: No category in URL'}
                disabled
                className="bg-gray-100 cursor-not-allowed"
            />
            {lesson.mainCategoryId && <p className="text-xs text-gray-500 mt-1">Associated Category ID: {lesson.mainCategoryId}</p>}
        </div>

        <RichTextEditorPlaceholder
          label="Lesson Content"
          value={lesson.content || ''}
          onChange={handleContentChange}
        />

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Lesson Type</label>
          <select
            id="type"
            name="type"
            value={lesson.type || 'text'}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="text">Text</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        {(lesson.type === 'video' || lesson.type === 'pdf') && (
          <Input
            label="Media URL (for Video/PDF)"
            id="mediaUrl"
            name="mediaUrl"
            type="url"
            value={lesson.mediaUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/video.mp4 or /path/to/document.pdf"
          />
        )}
         <Input
            label="Order (for sorting, lower numbers appear first)"
            id="order"
            name="order"
            type="number"
            value={lesson.order !== undefined ? lesson.order : 0}
            onChange={handleChange}
            min="0"
        />

        <div className="flex items-center">
            <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                checked={lesson.isPublished || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                Publish Lesson
            </label>
        </div>


        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 mt-8">
          <Button type="button" variant="ghost" onClick={() => navigate(`/admin/manage/${contentType}`)} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={saving} disabled={saving || loading}>
            {saving ? (isNewLesson ? 'Creating...' : 'Saving...') : (isNewLesson ? 'Create Lesson' : 'Save Changes')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminLessonEditorPage;
