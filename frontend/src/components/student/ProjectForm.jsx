'use client';

import React from 'react';
import { ArrowRight, Briefcase, Code2, ExternalLink, Eye, FileText, Github, ImagePlus, Loader, Pencil, Plus, Link2, Trash2, Scissors } from 'lucide-react';

const normalizeProjectLink = (value = '') => {
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export default function ProjectForm({
  loading,
  message,
  errors,
  editingProjectId,
  projectForm,
  projects,
  projectExistingScreenshots,
  projectNewScreenshots,
  onProjectFormChange,
  onProjectScreenshotsChange,
  onRemoveExistingScreenshot,
  onRemoveNewScreenshot,
  onCropNewScreenshot,
  onViewProjectImage,
  onSaveProject,
  onCancelEditing,
  onStartEditingProject,
  onRemoveProject,
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
}) {
  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.startsWith('Error:')
              ? 'bg-red-100 text-red-700 border border-red-200'
              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
            <Briefcase size={14} />
          </span>
          {editingProjectId ? 'Edit Project' : 'Add Project'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Briefcase size={14} className="text-slate-600" />
              Project Title
            </label>
            <input
              type="text"
              value={projectForm.title}
              onChange={(e) => onProjectFormChange('title', e.target.value)}
              className={`w-full p-2.5 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.title ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="e.g., Internship Matching Engine"
            />
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Code2 size={14} className="text-slate-600" />
              Technologies (comma separated)
            </label>
            <input
              type="text"
              value={projectForm.technologies}
              onChange={(e) => onProjectFormChange('technologies', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Github size={14} className="text-slate-600" />
              Repository URL (optional)
            </label>
            <input
              type="url"
              value={projectForm.repositoryUrl}
              onChange={(e) => onProjectFormChange('repositoryUrl', e.target.value)}
              onBlur={(e) => onProjectFormChange('repositoryUrl', normalizeProjectLink(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Link2 size={14} className="text-slate-600" />
              Live URL (optional)
            </label>
            <input
              type="url"
              value={projectForm.liveUrl}
              onChange={(e) => onProjectFormChange('liveUrl', e.target.value)}
              onBlur={(e) => onProjectFormChange('liveUrl', normalizeProjectLink(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://your-project.com"
            />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <FileText size={14} className="text-slate-600" />
            Description (optional)
          </label>
          <textarea
            rows={4}
            value={projectForm.description}
            onChange={(e) => onProjectFormChange('description', e.target.value.slice(0, 500))}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe your project and what you built"
          />
          <p className="text-xs text-slate-500 text-right">{projectForm.description.length}/500</p>
        </div>

        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ImagePlus size={14} className="text-slate-600" />
            Project Screenshots / UI Images
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={(e) => onProjectScreenshotsChange(e.target.files)}
            className="block w-full text-sm text-slate-700 file:mr-3 file:py-2.5 file:px-3.5 file:rounded-lg file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
          />
          <p className="text-xs text-slate-500">Upload up to 10 images. Each file must be JPG, PNG, or WEBP and under 5MB.</p>
          {errors.projectImages && <p className="text-xs text-red-600">{errors.projectImages}</p>}

          {projectExistingScreenshots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {projectExistingScreenshots.map((shot) => (
                <div key={shot._id} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => onViewProjectImage(shot.filePath, shot.fileName)}
                    className="block w-full text-left"
                    title="View full image"
                  >
                    <img src={shot.filePath} alt={shot.fileName} className="h-28 w-full object-cover" />
                  </button>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <p className="min-w-0 flex-1 truncate text-[11px] text-slate-600" title={shot.fileName}>
                      {shot.fileName}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onViewProjectImage(shot.filePath, shot.fileName)}
                        className="rounded-md p-1 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        title="View full image"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveExistingScreenshot(shot._id)}
                        className="rounded-md p-1 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Delete existing image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {projectNewScreenshots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {projectNewScreenshots.map((shot) => (
                <div key={shot.id} className="relative overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50">
                  <button
                    type="button"
                    onClick={() => onViewProjectImage(shot.preview, shot.name)}
                    className="block w-full text-left"
                    title="View full image"
                  >
                    <img src={shot.preview} alt={shot.name} className="h-28 w-full object-cover" />
                  </button>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <p className="min-w-0 flex-1 truncate text-[11px] text-slate-700" title={shot.name}>
                      {shot.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onViewProjectImage(shot.preview, shot.name)}
                        className="rounded-md p-1 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        title="View full image"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onCropNewScreenshot(shot.id)}
                        className="rounded-md p-1 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
                        title="Crop image"
                      >
                        <Scissors size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveNewScreenshot(shot.id)}
                        className="rounded-md p-1 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Delete selected image"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSaveProject}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : editingProjectId ? <Pencil size={14} /> : <Plus size={14} />}
            {editingProjectId ? 'Save Changes' : 'Add Project'}
          </button>
          {editingProjectId && (
            <button
              onClick={onCancelEditing}
              type="button"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Your Projects ({projects.length})</h3>

        {projects.length === 0 ? (
          <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-4">
            No projects added yet. Add at least one project to strengthen your profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div key={project._id} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{project.title}</h4>
                    {project.description && (
                      <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap">{project.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStartEditingProject(project)}
                      className="text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"
                      title="Edit project"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onRemoveProject(project._id)}
                      className="text-red-700 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {Array.isArray(project.screenshots) && project.screenshots.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {project.screenshots.slice(0, 4).map((shot, index) => (
                        <a
                          key={`${project._id}-shot-${index}`}
                          href={shot.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
                          title={shot.fileName}
                        >
                          <img src={shot.filePath} alt={shot.fileName} className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                    {project.screenshots.length > 4 && (
                      <p className="text-xs text-slate-500">+{project.screenshots.length - 4} more screenshot{project.screenshots.length - 4 === 1 ? '' : 's'}</p>
                    )}
                  </div>
                )}

                {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.technologies.map((tech, index) => (
                      <span key={`${project._id}-tech-${index}`} className="px-2 py-1 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {project.repositoryUrl && (
                    <a
                      href={normalizeProjectLink(project.repositoryUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      <Github size={12} />
                      Repo
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={normalizeProjectLink(project.liveUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      <ExternalLink size={12} />
                      Live
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
          <button
            onClick={onPrevious}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <ArrowRight size={16} className="rotate-180" />
            {previousLabel}
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            {nextLabel}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
