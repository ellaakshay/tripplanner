import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, Heart, Sparkles, Users, X } from 'lucide-react';

export default function FloatingMapCard({ stop, onClose }) {
  return (
    <AnimatePresence>
      {stop && (
        <motion.article initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.96 }} className="map-preview-card">
          <div className="map-preview-image" style={{ backgroundImage: `url(${stop.photo})` }}>
            <button type="button" onClick={onClose} aria-label="Close place preview" className="map-icon-button absolute right-3 top-3"><X size={16} /></button>
            <span className="map-preview-badge"><Sparkles size={13} /> {stop.hiddenGem ? 'Hidden gem' : 'On your route'}</span>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">{stop.time || 'Flexible stop'}</p><h3 className="mt-1 text-lg font-semibold text-white">{stop.name}</h3></div><Heart size={18} className="text-white/40" /></div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/60">{stop.description || 'A memorable pause worth making time for.'}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-[10px] text-white/55"><span className="flex items-center gap-1"><Clock3 size={12} /> {stop.travelTime || '12 min'}</span><span className="flex items-center gap-1"><Users size={12} /> {stop.crowd || 'Low'}</span><span className="text-right text-indigo-200">{stop.vibe || 'Curious'}</span></div>
          </div>
        </motion.article>
      )}
    </AnimatePresence>
  );
}
