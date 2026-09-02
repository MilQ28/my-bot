'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  FolderGit2,
  Cpu,
  FileText,
  Bot,
  LogOut,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Upload,
  RefreshCw,
  X,
  FileCheck
} from 'lucide-react';
import type { PortfolioData, ProjectItem } from '@/lib/dataStore';

interface Props {
  initialData: PortfolioData;
  token: string;
}

export default function AdminDashboardClient({ initialData }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'skills' | 'cv' | 'bot'>('profile');
  const [data, setData] = useState<PortfolioData>(initialData);
  const [initialDataJson, setInitialDataJson] = useState<string>(JSON.stringify(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // CV Upload state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  // Project Modal/Form state
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Unsaved changes detector
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== initialDataJson;
  }, [data, initialDataJson]);

  // Show toast notification
  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Save handler
  const handleSaveData = useCallback(async () => {
    if (!data || isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setInitialDataJson(JSON.stringify(data));
        showToast('success', 'Perubahan berhasil disimpan!');
      } else {
        showToast('error', resData.error || 'Gagal menyimpan data');
      }
    } catch {
      showToast('error', 'Gagal menghubungi server');
    } finally {
      setIsSaving(false);
    }
  }, [data, isSaving, showToast]);

  // Keyboard shortcut Ctrl + S / Cmd + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveData();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveData]);

  const handleLogout = async () => {
    if (isDirty && !confirm('Ada perubahan yang belum disimpan. Yakin ingin keluar?')) {
      return;
    }
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  const handleUploadCv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile || isUploadingCv) return;

    setIsUploadingCv(true);

    const formData = new FormData();
    formData.append('file', cvFile);

    try {
      const res = await fetch('/api/admin/upload-cv', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast('success', `File CV berhasil di-update (${resData.size})!`);
        setCvFile(null);
      } else {
        showToast('error', resData.error || 'Gagal mengunggah CV');
      }
    } catch {
      showToast('error', 'Gagal mengunggah file');
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !data) return;

    const existingIndex = data.projects.findIndex((p) => p.id === editingProject.id);
    let newProjects = [...data.projects];

    if (existingIndex >= 0) {
      newProjects[existingIndex] = editingProject;
    } else {
      newProjects.unshift(editingProject);
    }

    setData({ ...data, projects: newProjects });
    setIsProjectModalOpen(false);
    setEditingProject(null);
    showToast('success', 'Proyek diperbarui. Tekan Ctrl+S untuk simpan.');
  };

  const handleDeleteProject = (id: string) => {
    if (!data) return;
    if (confirm('Hapus proyek ini?')) {
      const filtered = data.projects.filter((p) => p.id !== id);
      setData({ ...data, projects: filtered });
      showToast('success', 'Proyek dihapus.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-foreground pt-12">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-panel border-b border-line px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            ADMIN PANEL
          </span>
          {isDirty && (
            <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Belum disimpan</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line text-xs font-mono text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition"
          >
            <span>Preview Web</span>
            <ExternalLink size={12} />
          </Link>

          <button
            onClick={handleSaveData}
            disabled={isSaving}
            title="Shortcut: Ctrl + S"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-mono text-xs font-bold uppercase transition cursor-pointer ${
              isDirty
                ? 'bg-primary text-foreground hover:opacity-90 shadow-sm'
                : 'bg-panel border border-line text-foreground/70 hover:text-foreground'
            }`}
          >
            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
            <span>{isSaving ? 'Menyimpan...' : 'Simpan (Ctrl+S)'}</span>
          </button>

          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-1.5 rounded-md border border-line text-foreground/50 hover:text-red-500 hover:border-red-500/30 transition cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── Main Layout: Sidebar + Content ── */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl w-full mx-auto">
        {/* Left Sidebar */}
        <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-line bg-panel/40 p-3 flex md:flex-col gap-1 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profil & Bio', icon: User },
            { id: 'projects', label: 'Proyek', count: data.projects.length, icon: FolderGit2 },
            { id: 'skills', label: 'Tech Stack', icon: Cpu },
            { id: 'cv', label: 'File CV PDF', icon: FileText },
            { id: 'bot', label: 'Chatbot AI', count: data.botConfig.quickPrompts.length, icon: Bot },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wide transition cursor-pointer text-left shrink-0 md:shrink ${
                  isActive
                    ? 'bg-foreground text-background font-bold shadow-xs'
                    : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-background/20 text-background' : 'bg-background border border-line text-foreground/50'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-3xl">
          {/* Tab 1: Profile & Bio */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-foreground font-sans">Profil &amp; Status Ketersediaan</h2>
                <p className="text-xs text-foreground/60 mt-0.5">Informasi umum yang tampil di Hero dan About.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] text-foreground/70 mb-1">Nama</label>
                    <input
                      type="text"
                      value={data.profile.name}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, name: e.target.value } })}
                      className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-sans focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-foreground/70 mb-1">Role</label>
                    <input
                      type="text"
                      value={data.profile.role}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, role: e.target.value } })}
                      className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-sans focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] text-foreground/70 mb-1">Status Ketersediaan</label>
                    <input
                      type="text"
                      value={data.profile.status}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, status: e.target.value } })}
                      className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-sans focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-foreground/70 mb-1">Fokus Stack (Hero Pass)</label>
                    <input
                      type="text"
                      value={data.profile.focus}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, focus: e.target.value } })}
                      className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-sans focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-foreground/70 mb-1">Domisili / Lokasi</label>
                  <input
                    type="text"
                    value={data.profile.location}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, location: e.target.value } })}
                    className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-sans focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-foreground/70 mb-1">Headline Bio (Hero Caption)</label>
                  <textarea
                    rows={2}
                    value={data.profile.bioQuote}
                    onChange={(e) => setData({ ...data, profile: { ...data.profile, bioQuote: e.target.value } })}
                    className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-foreground/70 mb-1">
                    Paragraf About (pisahkan paragraf dengan 2x Enter)
                  </label>
                  <textarea
                    rows={5}
                    value={data.profile.aboutParagraphs.join('\n\n')}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: {
                          ...data.profile,
                          aboutParagraphs: e.target.value.split('\n\n').filter((p) => p.trim().length > 0),
                        },
                      })
                    }
                    className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-sans leading-relaxed focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block font-mono text-[11px] text-foreground/70 mb-1">Email</label>
                    <input
                      type="email"
                      value={data.profile.email}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, email: e.target.value } })}
                      className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-foreground/70 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={data.profile.github}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, github: e.target.value } })}
                      className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-foreground/70 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={data.profile.linkedin}
                      onChange={(e) => setData({ ...data, profile: { ...data.profile, linkedin: e.target.value } })}
                      className="w-full rounded-md border border-line bg-background px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground font-sans">Proyek Unggulan</h2>
                  <p className="text-xs text-foreground/60">Tampil di urutan teratas section Projects.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProject({
                      id: `proj-${Date.now()}`,
                      title: '',
                      subtitle: '',
                      description: '',
                      technologies: ['Next.js', 'Laravel'],
                      githubUrl: '',
                      liveUrl: '',
                      status: 'In Active Development',
                      isFeatured: true,
                    });
                    setIsProjectModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-foreground text-xs font-mono font-bold uppercase rounded-md hover:opacity-90 transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="divide-y divide-line border border-line rounded-lg overflow-hidden bg-panel/30">
                {data.projects.map((proj) => (
                  <div key={proj.id} className="p-4 flex items-start justify-between gap-4 hover:bg-foreground/5 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{proj.title}</span>
                        {proj.status && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-line text-primary">
                            {proj.status}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-foreground/60">{proj.subtitle}</p>
                      <p className="text-xs text-foreground/80 line-clamp-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="font-mono text-[10px] text-foreground/60 bg-background px-1.5 py-0.5 border border-line rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingProject(proj);
                          setIsProjectModalOpen(true);
                        }}
                        className="p-1.5 border border-line rounded text-foreground/60 hover:text-foreground hover:bg-background transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 border border-line rounded text-foreground/60 hover:text-red-500 hover:border-red-500/30 transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Tech Stack */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-foreground font-sans">Tech Stack &amp; Skills</h2>
                <p className="text-xs text-foreground/60">Kelola kategori dan item skill pada section About.</p>
              </div>

              <div className="space-y-4">
                {data.skills.map((cat, catIdx) => (
                  <div key={catIdx} className="border border-line rounded-lg p-4 bg-panel/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-line pb-2">
                      <input
                        type="text"
                        value={cat.category}
                        onChange={(e) => {
                          const newSkills = [...data.skills];
                          newSkills[catIdx].category = e.target.value;
                          setData({ ...data, skills: newSkills });
                        }}
                        className="font-mono text-xs font-bold text-primary uppercase tracking-wider bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const newSkills = [...data.skills];
                          newSkills[catIdx].items.push({ name: '', desc: '' });
                          setData({ ...data, skills: newSkills });
                        }}
                        className="flex items-center gap-1 font-mono text-[11px] text-foreground/60 hover:text-foreground cursor-pointer"
                      >
                        <Plus size={11} />
                        <span>Tambah Item</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nama (e.g. Next.js)"
                            value={item.name}
                            onChange={(e) => {
                              const newSkills = [...data.skills];
                              newSkills[catIdx].items[itemIdx].name = e.target.value;
                              setData({ ...data, skills: newSkills });
                            }}
                            className="w-1/3 rounded border border-line bg-background px-2.5 py-1 text-xs font-mono font-bold focus:border-primary focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Deskripsi ringkas"
                            value={item.desc}
                            onChange={(e) => {
                              const newSkills = [...data.skills];
                              newSkills[catIdx].items[itemIdx].desc = e.target.value;
                              setData({ ...data, skills: newSkills });
                            }}
                            className="flex-1 rounded border border-line bg-background px-2.5 py-1 text-xs font-sans focus:border-primary focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const newSkills = [...data.skills];
                              newSkills[catIdx].items.splice(itemIdx, 1);
                              setData({ ...data, skills: newSkills });
                            }}
                            className="p-1 text-foreground/40 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Upload CV */}
          {activeTab === 'cv' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-foreground font-sans">Upload File CV / Resume PDF</h2>
                <p className="text-xs text-foreground/60 mt-0.5">
                  File yang diunggah akan otomatis menimpa file <code className="font-mono text-primary">public/cv.pdf</code>.
                </p>
              </div>

              <form onSubmit={handleUploadCv} className="border border-line rounded-lg p-6 bg-panel/30 space-y-4">
                <div className="border border-dashed border-line rounded-lg p-6 text-center hover:border-primary/50 transition">
                  <Upload size={20} className="mx-auto text-foreground/40 mb-2" />
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs font-mono text-foreground/70 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-primary file:text-foreground hover:file:opacity-90 cursor-pointer"
                  />
                  {cvFile && (
                    <p className="font-mono text-xs text-primary mt-2 flex items-center justify-center gap-1">
                      <FileCheck size={14} />
                      <span>{cvFile.name} ({(cvFile.size / 1024).toFixed(1)} KB)</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href="/cv.pdf"
                    target="_blank"
                    className="font-mono text-xs text-foreground/60 hover:text-foreground underline underline-offset-4 flex items-center gap-1"
                  >
                    <span>Preview CV Aktif</span>
                    <ExternalLink size={11} />
                  </a>

                  <button
                    type="submit"
                    disabled={!cvFile || isUploadingCv}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-foreground font-mono text-xs font-bold uppercase rounded-md hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
                  >
                    {isUploadingCv ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                    <span>{isUploadingCv ? 'Mengunggah...' : 'Upload PDF'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 5: AI Bot Config */}
          {activeTab === 'bot' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-foreground font-sans">Chatbot AI - Quick Prompts</h2>
                <p className="text-xs text-foreground/60 mt-0.5">Pertanyaan saran 1-klik yang muncul di widget chatbot.</p>
              </div>

              <div className="space-y-2 border border-line rounded-lg p-4 bg-panel/30">
                {data.botConfig.quickPrompts.map((prompt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-foreground/30 w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => {
                        const newPrompts = [...data.botConfig.quickPrompts];
                        newPrompts[idx] = e.target.value;
                        setData({ ...data, botConfig: { ...data.botConfig, quickPrompts: newPrompts } });
                      }}
                      className="flex-1 rounded border border-line bg-background px-3 py-1.5 text-xs font-sans focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const newPrompts = [...data.botConfig.quickPrompts];
                        newPrompts.splice(idx, 1);
                        setData({ ...data, botConfig: { ...data.botConfig, quickPrompts: newPrompts } });
                      }}
                      className="p-1 text-foreground/40 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setData({
                      ...data,
                      botConfig: {
                        ...data.botConfig,
                        quickPrompts: [...data.botConfig.quickPrompts, 'Pertanyaan baru?'],
                      },
                    });
                  }}
                  className="flex items-center gap-1 font-mono text-xs text-primary font-bold pt-2 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Tambah Prompt</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Floating Toast Feedback ── */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-md border font-mono text-xs shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30'
              : 'bg-red-950/90 text-red-300 border-red-500/30'
          }`}
        >
          {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Project Add/Edit Modal ── */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-panel border border-line rounded-lg p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="font-mono text-xs font-bold uppercase text-foreground">
                {data.projects.some((p) => p.id === editingProject.id) ? 'Edit Proyek' : 'Tambah Proyek'}
              </h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-foreground/40 hover:text-foreground">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3">
              <div>
                <label className="block font-mono text-[11px] text-foreground/70 mb-1">Nama Proyek</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="Contoh: Stellazone"
                  className="w-full rounded border border-line bg-background px-3 py-1.5 text-xs font-sans focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-foreground/70 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={editingProject.subtitle}
                  onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                  placeholder="Contoh: School Organization Web Platform"
                  className="w-full rounded border border-line bg-background px-3 py-1.5 text-xs font-sans focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-foreground/70 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Jelaskan fitur utama proyek..."
                  className="w-full rounded border border-line bg-background px-3 py-1.5 text-xs font-sans focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-foreground/70 mb-1">Teknologi (pisahkan koma)</label>
                <input
                  type="text"
                  value={editingProject.technologies.join(', ')}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      technologies: e.target.value.split(',').map((t) => t.trim()).filter((t) => t.length > 0),
                    })
                  }
                  placeholder="Next.js, Laravel, React"
                  className="w-full rounded border border-line bg-background px-3 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-mono text-[11px] text-foreground/70 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={editingProject.githubUrl}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full rounded border border-line bg-background px-3 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-foreground/70 mb-1">Status</label>
                  <input
                    type="text"
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                    placeholder="In Active Development"
                    className="w-full rounded border border-line bg-background px-3 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-line text-xs font-mono text-foreground/70 hover:bg-background cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-primary text-foreground text-xs font-mono font-bold uppercase hover:opacity-90 cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
