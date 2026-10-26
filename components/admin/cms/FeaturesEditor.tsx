'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import AdminModal from '../AdminModal';
import type { Feature } from '@/lib/cms-db';

const iconOptions = [
  { value: 'ShieldCheck', label: 'Shield Check' },
  { value: 'Award', label: 'Award' },
  { value: 'Banknote', label: 'Banknote' },
  { value: 'Users', label: 'Users' },
  { value: 'BookOpen', label: 'Book Open' },
  { value: 'Clock', label: 'Clock' },
  { value: 'CheckCircle', label: 'Check Circle' },
  { value: 'Star', label: 'Star' },
];

export default function FeaturesEditor() {
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'ShieldCheck',
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/admin/cms/features');
      const data = await res.json();
      if (data.features) {
        setFeatures(data.features);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingFeature?.id) {
        await fetch('/api/admin/cms/features', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingFeature.id, ...formData }),
        });
        toast.success('Feature updated successfully!');
      } else {
        const order = features.length + 1;
        await fetch('/api/admin/cms/features', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, order }),
        });
        toast.success('Feature created successfully!');
      }
      setIsModalOpen(false);
      setEditingFeature(null);
      setFormData({ title: '', description: '', icon: 'ShieldCheck' });
      fetchFeatures();
    } catch (error) {
      console.error('Error saving feature:', error);
      toast.error('Failed to save feature');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    try {
      await fetch(`/api/admin/cms/features?id=${id}`, {
        method: 'DELETE',
      });
      toast.success('Feature deleted successfully!');
      fetchFeatures();
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast.error('Failed to delete feature');
    }
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
    });
    setIsModalOpen(true);
  };

  const moveFeature = (index: number, direction: -1 | 1) => {
    const newFeatures = [...features];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newFeatures.length) return;

    const temp = newFeatures[index].order;
    newFeatures[index].order = newFeatures[newIndex].order;
    newFeatures[newIndex].order = temp;

    [newFeatures[index], newFeatures[newIndex]] = [newFeatures[newIndex], newFeatures[index]];
    setFeatures(newFeatures);

    // Update in backend
    Promise.all([
      fetch('/api/admin/cms/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newFeatures[index].id, order: newFeatures[index].order }),
      }),
      fetch('/api/admin/cms/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newFeatures[newIndex].id, order: newFeatures[newIndex].order }),
      }),
    ]).catch(console.error);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Features ({features.length})</h3>
        <button
          onClick={() => {
            setEditingFeature(null);
            setFormData({ title: '', description: '', icon: 'ShieldCheck' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#FACC15] text-[#111827] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#eab308] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Feature
        </button>
      </div>

      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={feature.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">{feature.icon}</span>
                  <input
                    type="text"
                    value={feature.title}
                    readOnly
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm font-bold bg-slate-50"
                  />
                </div>
                <textarea
                  value={feature.description}
                  readOnly
                  rows={2}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveFeature(index, -1)}
                  disabled={index === 0}
                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveFeature(index, 1)}
                  disabled={index === features.length - 1}
                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(feature)}
                  className="p-1 hover:bg-amber-50 rounded text-slate-500 hover:text-amber-600"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(feature.id!)}
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
          title={editingFeature ? 'Edit Feature' : 'Add New Feature'}
          onClose={() => {
            setIsModalOpen(false);
            setEditingFeature(null);
            setFormData({ title: '', description: '', icon: 'ShieldCheck' });
          }}
        >
          <div className="space-y-4">
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
              <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              >
                {iconOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingFeature(null);
                  setFormData({ title: '', description: '', icon: 'ShieldCheck' });
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
