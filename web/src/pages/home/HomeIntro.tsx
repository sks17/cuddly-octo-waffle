import { Billboard } from '@/components/layout/Billboard';
import { DescriptionIsland } from './DescriptionIsland';

/**
 * The homepage's in-flow region above the workspace: the billboard intro + the
 * customizable description island. The centered explorer island (WorkspaceShell)
 * and the footer follow it in normal document flow.
 */
export function HomeIntro() {
  return (
    <>
      <Billboard />
      <div
        id="home-description"
        className="mx-auto w-[var(--island-w)] max-w-[var(--island-max)] scroll-mt-[var(--taskbar-h)] pb-2 pt-1"
      >
        <DescriptionIsland />
      </div>
    </>
  );
}
