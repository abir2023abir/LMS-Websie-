'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Star } from 'lucide-react';
import AdminModal from '../AdminModal';
import RichTextEditor from '../RichTextEditor';
import type { BlogArticle } from '@/lib/cms-db';

const categories = [
  'Bookkeeping',
  'Business Finance',
  'Digital Skills',
  'Career Tips',
];

export default function BlogEditor() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'Speaking & Fluency',
    authorName: '',
    authorAvatar: '',
    authorRole: '',
    tags: '',
    readTime: '5 min read',
    isFeatured: false,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/admin/cms/blog');
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching blog articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const articleData = {
        slug: formData.slug,
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.coverImage,
        category: formData.category,
        author: {
          name: formData.authorName,
          avatar: formData.authorAvatar,
          role: formData.authorRole,
        },
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        readTime: formData.readTime,
        isFeatured: formData.isFeatured,
        publishedAt: editingArticle?.publishedAt || new Date().toISOString(),
      };

      if (editingArticle?.id) {
        await fetch('/api/admin/cms/blog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingArticle.id, ...articleData }),
        });
        toast.success('Article updated successfully!');
      } else {
        await fetch('/api/admin/cms/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articleData),
        });
        toast.success('Article created successfully!');
      }
      setIsModalOpen(false);
      setEditingArticle(null);
      setFormData({
        slug: '',
        title: '',
        excerpt: '',
        content: '',
        coverImage: '',
        category: 'Speaking & Fluency',
        authorName: '',
        authorAvatar: '',
        authorRole: '',
        tags: '',
        readTime: '5 min read',
        isFeatured: false,
      });
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await fetch(`/api/admin/cms/blog?id=${id}`, {
        method: 'DELETE',
      });
      toast.success('Article deleted successfully!');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  const handleEdit = (article: BlogArticle) => {
    setEditingArticle(article);
    setFormData({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage,
      category: article.category,
      authorName: article.author.name,
      authorAvatar: article.author.avatar,
      authorRole: article.author.role,
      tags: article.tags.join(', '),
      readTime: article.readTime,
      isFeatured: article.isFeatured,
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{articles.length ? `${articles.length} article${articles.length === 1 ? '' : 's'}.` : 'No articles yet.'} The blog page stays hidden on the site for now.</p>
        <button
          onClick={() => {
            setEditingArticle(null);
            setFormData({
              slug: '',
              title: '',
              excerpt: '',
              content: '',
              coverImage: '',
              category: 'Speaking & Fluency',
              authorName: '',
              authorAvatar: '',
              authorRole: '',
              tags: '',
              readTime: '5 min read',
              isFeatured: false,
            });
            setIsModalOpen(true);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Add Article
        </button>
      </div>

      {articles.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">Write your first article about bookkeeping, business finance or careers.</div>
      )}
      <div className="space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  {article.isFeatured && <Star className="w-4 h-4 text-[#FACC15] fill-[#FACC15]" />}
                  <input
                    type="text"
                    value={article.title}
                    readOnly
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm font-bold bg-slate-50"
                  />
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs">{article.category}</span>
                </div>
                <textarea
                  value={article.excerpt}
                  readOnly
                  rows={2}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 resize-none"
                />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{article.author.name}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                  <span>•</span>
                  <span>{article.tags.join(', ')}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleEdit(article)}
                  className="p-1 hover:bg-amber-50 rounded text-slate-500 hover:text-amber-600"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(article.id!)}
                  className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <AdminModal
          title={editingArticle ? 'Edit Article' : 'Add New Article'}
          onClose={() => {
            setIsModalOpen(false);
            setEditingArticle(null);
            setFormData({
              slug: '',
              title: '',
              excerpt: '',
              content: '',
              coverImage: '',
              category: 'Speaking & Fluency',
              authorName: '',
              authorAvatar: '',
              authorRole: '',
              tags: '',
              readTime: '5 min read',
              isFeatured: false,
            });
          }}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Content</label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Enter article content..."
                minHeight="200px"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Cover Image URL</label>
              <input
                type="text"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Author Name</label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Author Role</label>
                <input
                  type="text"
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Read Time</label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Author Avatar URL</label>
              <input
                type="text"
                value={formData.authorAvatar}
                onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#FACC15] focus:ring-[#FACC15]"
              />
              <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                Featured Article
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingArticle(null);
                  setFormData({
                    slug: '',
                    title: '',
                    excerpt: '',
                    content: '',
                    coverImage: '',
                    category: 'Speaking & Fluency',
                    authorName: '',
                    authorAvatar: '',
                    authorRole: '',
                    tags: '',
                    readTime: '5 min read',
                    isFeatured: false,
                  });
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#111827] text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
