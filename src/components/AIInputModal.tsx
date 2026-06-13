import { useState } from 'react';
import { processInput } from '../api/notes.api';
import { addNote } from '../api/notes.api';
import type { IAResponse, InputType } from '../types/note.types';
import {
    Bot,
    PenLine,
    CheckCircle2,
    AlertTriangle,
    X,
    ArrowLeft,
    Save,
    Plus,
} from 'lucide-react';
import './AIInputModal.css';

interface AIInputModalProps {
    groupId: string;
    onClose: () => void;
    onSaved: () => void;
}

type Step = 'input' | 'processing' | 'review';

const TYPE_LABELS: Record<InputType, string> = {
    TAREFA: 'Tarefa',
    META: 'Meta',
    RELATORIO_DIARIO: 'Relatório Diário',
    OBSERVACAO: 'Observação',
    DESCONHECIDO: 'Desconhecido',
};

export default function AIInputModal({ groupId, onClose, onSaved }: AIInputModalProps) {
    const [step, setStep] = useState<Step>('input');
    const [text, setText] = useState('');
    const [aiResult, setAiResult] = useState<IAResponse | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [expandedContent, setExpandedContent] = useState('');
    const [extractedItems, setExtractedItems] = useState<string[]>([]);
    const [nextSteps, setNextSteps] = useState<string[]>([]);
    const [autoTags, setAutoTags] = useState<string[]>([]);
    const [inferredDeadline, setInferredDeadline] = useState('');
    const [detectorType, setDetectorType] = useState<InputType>('DESCONHECIDO');

    const [newItem, setNewItem] = useState('');
    const [newStep, setNewStep] = useState('');
    const [newTag, setNewTag] = useState('');

    const handleProcess = async () => {
        if (!text.trim()) return;
        setError('');
        setStep('processing');

        try {
            const result = await processInput(text.trim());
            setAiResult(result);
            setTitle(result.title ?? '');
            setSummary(result.summary ?? '');
            setExpandedContent(result.expandedContent ?? '');
            setExtractedItems(result.extractedItems ?? []);
            setNextSteps(result.nextSteps ?? []);
            setAutoTags(result.autoTags ?? []);
            setInferredDeadline(result.inferredDeadline ? result.inferredDeadline.slice(0, 16) : '');
            setDetectorType(result.detectorType ?? 'DESCONHECIDO');
            setStep('review');
        } catch {
            setError('Erro ao processar com a Inteligência Artificial. Tente novamente mais tarde.');
            setStep('input');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await addNote({
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
            onSaved();
            onClose();
        } catch {
            setError('Erro ao salvar nota.');
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

    const stepTitle = {
        input: <><PenLine size={17} /> Nova nota com IA</>,
        processing: <><Bot size={17} /> Processando...</>,
        review: <><CheckCircle2 size={17} /> Revisar e salvar</>,
    };

    return (
        <div className="modal__backdrop" onClick={onClose} id="ai-modal-backdrop">
            <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">

                <div className="modal__header">
                    <h2 id="ai-modal-title" className="modal__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {stepTitle[step]}
                    </h2>
                    {step !== 'processing' && (
                        <button id="close-ai-modal" className="modal__close" onClick={onClose} aria-label="Fechar">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="modal__body">

                    {step === 'input' && (
                        <>
                            {error && (
                                <div className="error-msg">
                                    <AlertTriangle size={15} /> {error}
                                </div>
                            )}
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                Descreva uma tarefa, meta, observação ou relatório em linguagem natural. A IA vai estruturar automaticamente.
                            </p>
                            <div className="form__group">
                                <label className="form__label" htmlFor="ai-text-input">Seu texto</label>
                                <textarea
                                    id="ai-text-input"
                                    className="form__input form__textarea"
                                    placeholder="Ex: Preciso terminar o relatório mensal até sexta-feira e enviar para o time de marketing com os dados do mês de maio..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={6}
                                    autoFocus
                                />
                            </div>
                            <div className="modal__footer">
                                <button id="cancel-ai-btn" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
                                <button
                                    id="process-ai-btn"
                                    className="btn btn--primary"
                                    onClick={handleProcess}
                                    disabled={!text.trim()}
                                >
                                    <Bot size={15} /> Processar com IA
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="ai-modal__processing">
                            <div className="ai-modal__pulse">
                                <Bot size={26} color="#fff" />
                            </div>
                            <p style={{ fontWeight: 600, fontSize: 16 }}>Analisando seu texto...</p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                A IA está estruturando sua nota. Isso pode levar alguns segundos.
                            </p>
                        </div>
                    )}

                    {step === 'review' && aiResult && (
                        <>
                            {error && (
                                <div className="error-msg">
                                    <AlertTriangle size={15} /> {error}
                                </div>
                            )}

                            <div className="ai-modal__form-row">
                                <div className="form__group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form__label" htmlFor="review-title">Título</label>
                                    <input id="review-title" className="form__input" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>

                                <div className="form__group">
                                    <label className="form__label" htmlFor="review-type">Tipo detectado</label>
                                    <select id="review-type" className="form__input" value={detectorType} onChange={(e) => setDetectorType(e.target.value as InputType)}>
                                        {(Object.keys(TYPE_LABELS) as InputType[]).map((t) => (
                                            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form__group">
                                    <label className="form__label" htmlFor="review-deadline">Prazo estimado</label>
                                    <input id="review-deadline" type="datetime-local" className="form__input" value={inferredDeadline} onChange={(e) => setInferredDeadline(e.target.value)} />
                                </div>
                            </div>

                            <div className="form__group">
                                <label className="form__label" htmlFor="review-summary">Resumo</label>
                                <textarea id="review-summary" className="form__input form__textarea" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
                            </div>

                            <div className="form__group">
                                <label className="form__label" htmlFor="review-expanded">Conteúdo expandido</label>
                                <textarea id="review-expanded" className="form__input form__textarea" rows={3} value={expandedContent} onChange={(e) => setExpandedContent(e.target.value)} />
                            </div>

                            <div className="form__group">
                                <label className="form__label">Itens extraídos</label>
                                <div className="ai-modal__tag-list" style={{ marginBottom: 6 }}>
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
                                    <input id="new-extracted-item" className="form__input" placeholder="Adicionar item..." value={newItem} onChange={(e) => setNewItem(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(setExtractedItems, newItem, setNewItem))} />
                                    <button className="btn btn--ghost btn--sm" onClick={() => addListItem(setExtractedItems, newItem, setNewItem)}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="form__group">
                                <label className="form__label">Próximos passos</label>
                                <div className="ai-modal__tag-list" style={{ marginBottom: 6 }}>
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
                                    <input id="new-next-step" className="form__input" placeholder="Adicionar passo..." value={newStep} onChange={(e) => setNewStep(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(setNextSteps, newStep, setNewStep))} />
                                    <button className="btn btn--ghost btn--sm" onClick={() => addListItem(setNextSteps, newStep, setNewStep)}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="form__group">
                                <label className="form__label">Tags</label>
                                <div className="ai-modal__tag-list" style={{ marginBottom: 6 }}>
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
                                    <input id="new-tag" className="form__input" placeholder="Adicionar tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(setAutoTags, newTag, setNewTag))} />
                                    <button className="btn btn--ghost btn--sm" onClick={() => addListItem(setAutoTags, newTag, setNewTag)}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="modal__footer">
                                <button id="back-to-input-btn" className="btn btn--ghost" onClick={() => setStep('input')}>
                                    <ArrowLeft size={14} /> Reeditar texto
                                </button>
                                <button id="save-note-btn" className="btn btn--primary" onClick={handleSave} disabled={saving || !title.trim()}>
                                    {saving ? <><div className="spinner" /> Salvando...</> : <><Save size={15} /> Salvar nota</>}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
