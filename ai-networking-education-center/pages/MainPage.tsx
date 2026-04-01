import React, { Suspense, useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import HomeDashboard from '../components/HomeDashboard';
import TableOfContents from '../components/TableOfContents';
import Footer from '../components/Footer';
import FadeIn from '../components/FadeIn';
import AdminDashboard from '../components/AdminDashboard';
import SearchPalette from '../components/SearchPalette';
import NextSectionCTA from '../components/NextSectionCTA';
import StickyModuleHeader from '../components/StickyModuleHeader';
import { useSearchPalette } from '../hooks/useSearchPalette';
import { MODULE_REGISTRY } from '../app/moduleRegistry';

/**
 * MainPage
 *
 * The primary scrollable page rendered at "/".
 * Renders all modules with page === 'main' sequentially via MODULE_REGISTRY.
 */
const MainPage: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const palette = useSearchPalette();
  const mainModules = MODULE_REGISTRY.filter(m => m.page === 'main');

  // Scroll to hash anchor on load, retrying after lazy chunks mount
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    const attempt = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    attempt();
    const t = setTimeout(attempt, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 selection:bg-blue-500/30 pb-32">
      {/* Global Navigation Elements */}
      <Navigation onSearchClick={palette.open} />
      <TableOfContents />
      <SearchPalette palette={palette} />
      <StickyModuleHeader />

      <main>
        {/* Architecture Domain Dashboard */}
        <HomeDashboard />

        {/* Architecture Reference Sections (Scrollable) */}
        {mainModules.map(({ id, component: SectionComponent }) => (
          <React.Fragment key={id}>
            <FadeIn>
              <Suspense
                fallback={<div className="container mx-auto px-6 py-10 text-sm text-slate-500">Loading section...</div>}
              >
                <SectionComponent />
              </Suspense>
            </FadeIn>
            <NextSectionCTA currentId={id} />
          </React.Fragment>
        ))}
      </main>

      {/* Footer & Admin Triggers */}
      <Footer onAdminClick={() => setIsAdminOpen(true)} />
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};

export default MainPage;
