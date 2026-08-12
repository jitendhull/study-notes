'use client';

import { useEffect, useState } from 'react';
import { Check, PencilLine, Save } from 'lucide-react';
import { ANNOTATIONS_EVENT, getAnnotation, setAnnotation } from '@/components/AnnotationStorage';

export function AnnotationPanel({ noteId }: { noteId: string }) {
  const [value, setValue] = useState('');
  const [savedValue, setSavedValue] = useState('');
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => {
      const next = getAnnotation(noteId);
      setValue(next);
      setSavedValue(next);
      setReady(true);
    };
    sync();
    window.addEventListener(ANNOTATIONS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ANNOTATIONS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [noteId]);

  const save = () => {
    setAnnotation(noteId, value);
    setSavedValue(value);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const discard = () => setValue(savedValue);
  const dirty = value !== savedValue;

  if (!ready) return <section className="annotation-panel" aria-busy="true" />;

  return (
    <section className="annotation-panel" aria-labelledby="annotation-title">
      <div className="annotation-heading">
        <div>
          <p className="annotation-kicker"><PencilLine size={14} aria-hidden="true" /> Private annotation</p>
          <h2 id="annotation-title">What do you want to remember?</h2>
        </div>
        <span className="annotation-local-note">Saved on this device</span>
      </div>
      <textarea
        className="annotation-input"
        value={value}
        onChange={event => { setValue(event.target.value); setSaved(false); }}
        placeholder="Write a definition, question, example, or revision reminder…"
        rows={5}
        aria-label="Private annotation for this note"
      />
      <div className="annotation-footer">
        <span className="annotation-hint">{value.length.toLocaleString()} characters · private to this browser</span>
        <div className="annotation-actions">
          {dirty && <button type="button" className="annotation-discard" onClick={discard}>Discard changes</button>}
          <button type="button" className="annotation-save" onClick={save} disabled={!dirty}>
            {saved ? <Check size={15} aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
            {saved ? 'Saved' : 'Save annotation'}
          </button>
        </div>
      </div>
    </section>
  );
}
