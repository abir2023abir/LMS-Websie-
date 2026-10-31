'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, ShieldCheck, Award, Banknote, Users, BookOpen, Clock, CheckCircle, Star, Sparkles, type LucideIcon } from 'lucide-react';
import AdminModal from '../AdminModal';
import type { Feature } from '@/lib/cms-db';

const iconOptions: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'ShieldCheck', label: 'Shield', Icon: ShieldCheck },
  { value: 'Award', label: 'Award', Icon: Award },
  { value: 'Banknote', label: 'Money', Icon: Banknote },
  { value: 'Users', label: 'People', Icon: Users },
  { value: 'BookOpen', label: 'Book', Icon: BookOpen },
  { value: 'Clock', label: 'Clock', Icon: Clock },
  { value: 'CheckCircle', label: 'Check', Icon: CheckCircle },
  { value: 'Star', label: 'Star', Icon: Star },
];
const iconFor = (name: string) => iconOptions.find((option) => option.value === name)?.Icon || Sparkles;

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
        <p className="text-sm text-slate-600">{features.length} reason{features.length === 1 ? '' : 's'} shown on the home page. Use the arrows to change the order.</p>
        <button
          onClick={() => {
            setEditingFeature(null);
            setFormData({ title: '', description: '', icon: 'ShieldCheck' });
            setIsModalOpen(true);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Add Feature
        </button>
      </div>

      {features.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">No reasons yet. Add the first one.</div>
      ) : (
      <div className="grid gap-3 md:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = iconFor(feature.icon);
          return (
          <div key={feature.id} className="flex gap-3 rounded-2xl border border-slate-200 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3] text-[#A16207]"><Icon className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900">{feature.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{feature.description}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-0.5">
              <button onClick={() => moveFeature(index, -1)} disabled={index === 0} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30" title="Move up"><ArrowUp className="h-4 w-4" /></button>
              <button onClick={() => moveFeature(index, 1)} disabled={index === features.length - 1} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30" title="Move down"><ArrowDown className="h-4 w-4" /></button>
              <button onClick={() => handleEdit(feature)} className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-700" title="Edit"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(feature.id!)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          );
        })}
      </div>
      )}

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
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map(({ value, label, Icon }) => (
                  <button key={value} type="button" onClick={() => setFormData({ ...formData, icon: value })} className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-[11px] font-semibold ${formData.icon === value ? 'border-[#FACC15] bg-[#FEF9C3] text-[#111827]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <Icon className="h-5 w-5" />{label}
                  </button>
                ))}
              </div>
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
