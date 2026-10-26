'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminModal from '../AdminModal';
import RichTextEditor from '../RichTextEditor';
import { getHeroContent, updateHeroContent } from '@/lib/landing-cms';

export default function HeroSectionManagement() {
  const [heroData, setHeroData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadHeroContent();
  }, []);

  const loadHeroContent = async () => {
    try {
      const data = await getHeroContent();
      setHeroData(data);
    } catch (error) {
      toast.error('Failed to load hero content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      await updateHeroContent(formData);
      await loadHeroContent();
      toast.success('Hero content updated successfully!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to update hero content');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Content Preview */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Current Hero Content</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#111827] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Edit Hero
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Headline</label>
            <div className="p-3 bg-slate-50 rounded-lg text-sm">{heroData?.headline}</div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
            <div className="p-3 bg-slate-50 rounded-lg text-sm">{heroData?.description}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Primary CTA Text</label>
              <div className="p-3 bg-slate-50 rounded-lg text-sm">{heroData?.primary_cta_text}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Primary CTA URL</label>
              <div className="p-3 bg-slate-50 rounded-lg text-sm">{heroData?.primary_cta_url}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Secondary CTA Text</label>
              <div className="p-3 bg-slate-50 rounded-lg text-sm">{heroData?.secondary_cta_text}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Secondary CTA URL</label>
              <div className="p-3 bg-slate-50 rounded-lg text-sm">{heroData?.secondary_cta_url}</div>
            </div>
          </div>
          {heroData?.background_image_url && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Background Image</label>
              <img src={heroData.background_image_url} alt="Background" className="w-full h-32 object-cover rounded-lg" />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <AdminModal
          title="Edit Hero Content"
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = {
              headline: (e.target as any).headline.value,
              description: (e.target as any).description.value,
              primary_cta_text: (e.target as any).primary_cta_text.value,
              primary_cta_url: (e.target as any).primary_cta_url.value,
              secondary_cta_text: (e.target as any).secondary_cta_text.value,
              secondary_cta_url: (e.target as any).secondary_cta_url.value,
              background_image_url: (e.target as any).background_image_url.value,
            };
            handleSave(formData);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Headline</label>
                <input
                  name="headline"
                  defaultValue={heroData?.headline}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={heroData?.description}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Primary CTA Text</label>
                  <input
                    name="primary_cta_text"
                    defaultValue={heroData?.primary_cta_text}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Primary CTA URL</label>
                  <input
                    name="primary_cta_url"
                    defaultValue={heroData?.primary_cta_url}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Secondary CTA Text</label>
                  <input
                    name="secondary_cta_text"
                    defaultValue={heroData?.secondary_cta_text}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Secondary CTA URL</label>
                  <input
                    name="secondary_cta_url"
                    defaultValue={heroData?.secondary_cta_url}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Background Image URL</label>
                <input
                  name="background_image_url"
                  defaultValue={heroData?.background_image_url}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#111827] text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}
