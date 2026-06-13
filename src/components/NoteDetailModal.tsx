import { useState } from 'react';
import { deleteNote, updateNote } from '../api/notes.api';
import type { NoteResponse, InputType } from '../types/note.types';
import { X, Trash2, Clock, CalendarDays, Edit2, Save, Plus } from 'lucide-react';
import './NoteDetailModal.css';

interface NoteDetailModalProps {
    note: NoteResponse;
    groupId: string;
    onClose: () => void;
    onDeleted: () => void;
}

const TYPE_LABELS: Record<InputType, string> = {
    TAREFA: 'Tarefa',
    META: 'Meta',
    RELATORIO_DIARIO: 'Relatório Diário',
    OBSERVACAO: 'Observação',
    DESCONHECIDO: 'Desconhecido',
};

export default function NoteDetailModal({ note, groupId, onClose, onDeleted }: NoteDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState(note.title);
    const [summary, setSummary] = useState(note.summary);
    const [expandedContent, setExpandedContent] = useState(note.expandedContent);
    const [extractedItems, setExtractedItems] = useState<string[]>(note.extractedItems ?? []);
    const [nextSteps, setNextSteps] = useState<string[]>(note.nextSteps ?? []);
    const [autoTags, setAutoTags] = useState<string[]>(note.autoTags ?? []);
    const [inferredDeadline, setInferredDeadline] = useState(note.inferredDeadline ? note.inferredDeadline.slice(0, 16) : '');
    const [detectorType, setDetectorType] = useState<InputType>(note.detectorType);

    const [newItem, setNewItem] = useState('');
    const [newStep, setNewStep] = useState('');
    const [newTag, setNewTag] = useState('');

    const handleDelete = async () => {
        if (!confirm('Deletar esta nota?')) return;
        try {
            await deleteNote(note.id);
            onDeleted();
            onClose();
        } catch {
            alert('Erro ao deletar nota.');
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            await updateNote(note.id, {
                noteId: note.id,
                groupId,
                title,
                summary,
                expandedContent,
                extractedItems,
                nextSteps,
                autoTags,
                inferredDeadline: inferredDeadline ? new Date(inferredDeadline).toISOString() : new Date().toISOString(),
                detectorType,
            });
            onDeleted();
            setIsEditing(false);
        } catch {
            alert('Erro ao atualizar nota.');
        } finally {
            setSaving(false);
        }
    };

    const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, val: string, clearSetter: React.Dispatch<React.SetStateAction<string>>) => {
        if (!val.trim()) return;
        setter((prev) => [...prev, val.trim()]);
        clearSetter('');
    };

    const removeListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter((prev) => prev.filter((_, i) => i !== index));
    };

    const formattedDate = new Date(note.createdAt).toLocaleString('pt-BR');
    const deadlineStr = note.inferredDeadline
        ? new Date(note.inferredDeadline).toLocaleString('pt-BR')
        : 'Sem prazo';

    return (
        <div className="modal__backdrop" onClick={onClose} id="note-modal-backdrop">
            <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">

                <div className="modal__header" style={{ marginBottom: isEditing ? 12 : 20 }}>
                    {isEditing ? (
                        <div className="form__group" style={{ flex: 1, marginRight: 16 }}>
                            <input
                                id="edit-title"
                                className="form__input"
                                style={{ fontSize: 18, fontWeight: 700 }}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Título da nota"
                            />
                        </div>
                    ) : (
                        <h2 id="modal-title" className="modal__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {title}
                            <span className={`badge badge--${detectorType.toLowerCase().replace('_', '-')}`} style={{ fontSize: 10 }}>
                                {TYPE_LABELS[detectorType]}
                            </span>
                        </h2>
                    )}

                    <button id="close-modal-btn" className="modal__close" onClick={onClose} aria-label="Fechar">
                        <X size={16} />
                    </button>
                </div>

                <div className="modal__body">
                    {isEditing ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form__group">
                                    <label className="form__label">Tipo detectado</label>
                                    <select className="form__input" value={detectorType} onChange={(e) => setDetectorType(e.target.value as InputType)}>
                                        {(Object.keys(TYPE_LABELS) as InputType[]).map((t) => (
                                            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form__group">
                                    <label className="form__label">Prazo estimado</label>
                                    <input type="datetime-local" className="form__input" value={inferredDeadline} onChange={(e) => setInferredDeadline(e.target.value)} />
                                </div>
                            </div>

                            <div className="form__group">
                                <label className="form__label">Resumo</label>
                                <textarea className="form__input form__textarea" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
                            </div>

                            <div className="form__group">
                                <label className="form__label">Conteúdo expandido</label>
                                <textarea className="form__input form__textarea" rows={4} value={expandedContent} onChange={(e) => setExpandedContent(e.target.value)} />
                            </div>

                            <div className="form__group">
                                <label className="form__label">Itens Identificados</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                                    {extractedItems.map((item, i) => (
                                        <span key={i} className="tag tag--removable">
                                            {item}
                                            <button className="tag__remove-btn" onClick={() => removeListItem(setExtractedItems, i)}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="form__input" placeholder="Adicionar item..." value={newItem} onChange={(e) => setNewItem(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(setExtractedItems, newItem, setNewItem))} />
                                    <button className="btn btn--ghost btn--sm" onClick={() => addListItem(setExtractedItems, newItem, setNewItem)}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="form__group">
                                <label className="form__label">Próximos Passos</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                                    {nextSteps.map((step, i) => (
                                        <span key={i} className="tag tag--removable">
                                            {step}
                                            <button className="tag__remove-btn" onClick={() => removeListItem(setNextSteps, i)}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="form__input" placeholder="Adicionar passo..." value={newStep} onChange={(e) => setNewStep(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(setNextSteps, newStep, setNewStep))} />
                                    <button className="btn btn--ghost btn--sm" onClick={() => addListItem(setNextSteps, newStep, setNewStep)}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="form__group">
                                <label className="form__label">Tags</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                                    {autoTags.map((tag, i) => (
                                        <span key={i} className="tag tag--removable">
                                            #{tag}
                                            <button className="tag__remove-btn" onClick={() => removeListItem(setAutoTags, i)}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="form__input" placeholder="Adicionar tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(setAutoTags, newTag, setNewTag))} />
                                    <button className="btn btn--ghost btn--sm" onClick={() => addListItem(setAutoTags, newTag, setNewTag)}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {summary && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>{summary}</p>
                            )}

                            <div className="note-detail__section" style={{ background: 'var(--bg-surface)' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{expandedContent}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {extractedItems.length > 0 && (
                                    <div className="note-detail__section">
                                        <p className="note-detail__section-title">Itens Identificados</p>
                                        <ul className="note-detail__list">
                                            {extractedItems.map((item, i) => (
                                                <li key={i} className="note-detail__list-item">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {nextSteps.length > 0 && (
                                    <div className="note-detail__section">
                                        <p className="note-detail__section-title">Próximos Passos</p>
                                        <ul className="note-detail__list">
                                            {nextSteps.map((step, i) => (
                                                <li key={i} className="note-detail__list-item">{step}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {autoTags.length > 0 && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                                    {autoTags.map((tag, i) => (
                                        <span key={i} className="tag">#{tag}</span>
                                    ))}
                                </div>
                            )}

                            <div className="divider">Metadados</div>

                            <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Clock size={14} /> Criado em: {formattedDate}
                                </div>
                                {detectorType === 'META' || detectorType === 'TAREFA' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: inferredDeadline ? 'var(--accent-2)' : 'inherit' }}>
                                        <CalendarDays size={14} /> Prazo: {deadlineStr}
                                    </div>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>

                <div className="modal__footer">
                    {isEditing ? (
                        <>
                            <button className="btn btn--ghost btn--sm" onClick={() => setIsEditing(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn--primary btn--sm" onClick={handleUpdate} disabled={saving || !title.trim()}>
                                {saving ? <><div className="spinner" /> Salvando...</> : <><Save size={14} /> Salvar Edições</>}
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn--ghost btn--sm" onClick={() => setIsEditing(true)}>
                                <Edit2 size={14} /> Editar
                            </button>
                            <button id="delete-note-btn" className="btn btn--danger btn--sm" onClick={handleDelete}>
                                <Trash2 size={14} /> Deletar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
