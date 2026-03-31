import { useState, useEffect, useRef } from 'react';
import {
  DndContext, DragOverlay, pointerWithin, rectIntersection,
  getFirstCollision, closestCenter,
  PointerSensor, useSensor, useSensors,
  useDroppable
} from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import html2canvas from 'html2canvas';
import { getGames, getTierList, saveTierList } from '../api';
import './TierListView.css';

const TIER_LABELS = ['S', 'A', 'B', 'C', 'D'];
const TIER_COLORS = {
  S: '#ff7f7f', A: '#ffbf7f', B: '#ffdf7f', C: '#bfdf7f', D: '#7fbfff'
};

// Makes the tier container itself a drop target (needed for empty tiers)
function DroppableTier({ id, children, className }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`${className}${isOver ? ' is-over' : ''}`} data-tier={id}>
      {children}
    </div>
  );
}

function GameCard({ game }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: game._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="tier-card">
      {game.coverUrl
        ? <img src={game.coverUrl} alt={game.title} draggable={false} crossOrigin="anonymous" />
        : <div className="tier-card-placeholder">{game.title.charAt(0)}</div>}
      <span className="tier-card-title">{game.title}</span>
    </div>
  );
}

function TierListView() {
  const [tiers, setTiers]       = useState({ S: [], A: [], B: [], C: [], D: [], unranked: [] });
  const [allGames, setAllGames] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const saveTimer = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    Promise.all([getGames(), getTierList()]).then(([games, saved]) => {
      setAllGames(games);
      const rankedIds = new Set(Object.values(saved.tiers || {}).flat());
      const rehydrated = {};
      for (const tier of TIER_LABELS) {
        rehydrated[tier] = (saved.tiers?.[tier] || [])
          .map(id => games.find(g => g._id === id))
          .filter(Boolean);
      }
      rehydrated.unranked = games.filter(g => !rankedIds.has(g._id));
      setTiers(rehydrated);
    });
  }, []);

  function findTierOf(gameId) {
    return Object.keys(tiers).find(t => tiers[t].some(g => g._id === gameId));
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over) return;
    const srcTier = findTierOf(active.id);
    // over.id is either a tier name ('S','A',...,'unranked') or a game._id
    const destTier = tiers[over.id] !== undefined ? over.id : findTierOf(over.id);
    if (!srcTier || !destTier || srcTier === destTier) return;
    const game = tiers[srcTier].find(g => g._id === active.id);
    const newTiers = {
      ...tiers,
      [srcTier]:  tiers[srcTier].filter(g => g._id !== active.id),
      [destTier]: [...tiers[destTier], game]
    };
    setTiers(newTiers);
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(() => {
      const toSave = {};
      for (const t of TIER_LABELS) toSave[t] = newTiers[t].map(g => g._id);
      saveTierList(toSave).finally(() => setSaving(false));
    }, 1000);
  }

  async function exportImage() {
    const el = document.getElementById('tier-list-capture');
    const canvas = await html2canvas(el, { backgroundColor: '#0f1722', scale: 2, useCORS: true, allowTaint: false });
    const link = document.createElement('a');
    link.download = 'my-game-tier-list.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  const activeGame = allGames.find(g => g._id === activeId);

  return (
    <div className="tierlist-page">
      <div className="tierlist-header">
        <div>
          <h2 className="tierlist-title">Tier List</h2>
          <p className="tierlist-subtitle">Drag games from the pool below into a tier row — changes save automatically.</p>
        </div>
        <div className="tierlist-actions">
          {saving && <span className="tierlist-saving">Saving&hellip;</span>}
          <button onClick={exportImage} className="export-btn">Export PNG</button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={e => setActiveId(e.active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div id="tier-list-capture" className="tierlist-board">
          {TIER_LABELS.map(tier => (
            <div key={tier} className="tier-row">
              <div className="tier-label" style={{ background: TIER_COLORS[tier] }}>
                {tier}
              </div>
              <SortableContext id={tier} items={tiers[tier].map(g => g._id)} strategy={rectSortingStrategy}>
                <DroppableTier id={tier} className="tier-games">
                  {tiers[tier].map(g => <GameCard key={g._id} game={g} />)}
                  {tiers[tier].length === 0 && <span className="tier-empty-hint">Drop here</span>}
                </DroppableTier>
              </SortableContext>
            </div>
          ))}
        </div>

        <div className="tier-unranked">
          <h4 className="tier-unranked-title">
            Unranked
            {tiers.unranked.length > 0 && <span className="unranked-badge">{tiers.unranked.length}</span>}
          </h4>
          <SortableContext id="unranked" items={tiers.unranked.map(g => g._id)} strategy={rectSortingStrategy}>
            <DroppableTier id="unranked" className="tier-games unranked-pool">
              {tiers.unranked.map(g => <GameCard key={g._id} game={g} />)}
              {tiers.unranked.length === 0 && (
                <span className="tier-empty-hint all-ranked">All games ranked!</span>
              )}
            </DroppableTier>
          </SortableContext>
        </div>

        <DragOverlay>
          {activeGame && (
            <div className="tier-card is-dragging">
              {activeGame.coverUrl
                ? <img src={activeGame.coverUrl} alt={activeGame.title} crossOrigin="anonymous" />
                : <div className="tier-card-placeholder">{activeGame.title.charAt(0)}</div>}
              <span className="tier-card-title">{activeGame.title}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default TierListView;
