'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import AdminModal from '../AdminModal';
import type { SuccessStory } from '@/lib/cms-db';

export default function SuccessStoriesEditor() {
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    caption: '',
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/admin/cms/success-stories');
      const data = await res.json();
      if (data.stories) {
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Error fetching success stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingStory?.id) {
        await fetch('/api/admin/cms/success-stories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingStory.id, ...formData }),
        });
        toast.success('Story updated successfully!');
      } else {
        const order = stories.length + 1;
        await fetch('/api/admin/cms/success-stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, order }),
        });
        toast.success('Story created successfully!');
      }
      setIsModalOpen(false);
      setEditingStory(null);
      setFormData({ headline: '', description: '', caption: '' });
      fetchStories();
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Failed to save story');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      await fetch(`/api/admin/cms/success-stories?id=${id}`, {
        method: 'DELETE',
      });
      toast.success('Story deleted successfully!');
      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    }
  };

  const handleEdit = (story: SuccessStory) => {
    setEditingStory(story);
    setFormData({
      headline: story.headline,
      description: story.description,
      caption: story.caption,
    });
    setIsModalOpen(true);
  };

  const moveStory = (index: number, direction: -1 | 1) => {
    const newStories = [...stories];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newStories.length) return;

    const temp = newStories[index].order;
    newStories[index].order = newStories[newIndex].order;
    newStories[newIndex].order = temp;

    [newStories[index], newStories[newIndex]] = [newStories[newIndex], newStories[index]];
    setStories(newStories);

    // Update in backend
    Promise.all([
      fetch('/api/admin/cms/success-stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newStories[index].id, order: newStories[index].order }),
      }),
      fetch('/api/admin/cms/success-stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newStories[newIndex].id, order: newStories[newIndex].order }),
      }),
    ]).catch(console.error);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Success Stories ({stories.length})</h3>
        <button
          onClick={() => {
            setEditingStory(null);
            setFormData({ headline: '', description: '', caption: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#FACC15] text-[#111827] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#eab308] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Story
        </button>
      </div>

      <div className="space-y-3">
        {stories.map((story, index) => (
          <div key={story.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={story.headline}
                  readOnly
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm font-bold bg-slate-50"
                />
                <textarea
                  value={story.description}
                  readOnly
                  rows={2}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 resize-none"
                />
                <input
                  type="text"
                  value={story.caption}
                  readOnly
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 italic"
                />
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveStory(index, -1)}
                  disabled={index === 0}
                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveStory(index, 1)}
                  disabled={index === stories.length - 1}
                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(story)}
                  className="p-1 hover:bg-amber-50 rounded text-slate-500 hover:text-amber-600"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(story.id!)}
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
          title={editingStory ? 'Edit Story' : 'Add New Story'}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStory(null);
            setFormData({ headline: '', description: '', caption: '' });
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Caption</label>
              <input
                type="text"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStory(null);
                  setFormData({ headline: '', description: '', caption: '' });
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
