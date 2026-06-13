import type { NoteResponse, InputType } from '../types/note.types';
import { CheckSquare, Target, BarChart2, Eye, HelpCircle } from 'lucide-react';
import './NoteCard.css';

interface NoteCardProps {
    note: NoteResponse;
    onClick: () => void;
}

const TYPE_ICONS: Record<InputType, React.ReactNode> = {
    TAREFA: <CheckSquare size={13} />,
    META: <Target size={13} />,
    RELATORIO_DIARIO: <BarChart2 size={13} />,
    OBSERVACAO: <Eye size={13} />,
    DESCONHECIDO: <HelpCircle size={13} />,
};

const TYPE_LABELS: Record<InputType, string> = {
    TAREFA: 'Tarefa',
    META: 'Meta',
    RELATORIO_DIARIO: 'Relatório',
    OBSERVACAO: 'Observação',
    DESCONHECIDO: 'Outro',
};

export default function NoteCard({ note, onClick }: NoteCardProps) {
    const dateStr = new Date(note.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    });

    return (
        <div className="note-card" onClick={onClick} id={`note-${note.id}`}>
            <div className="note-card__header">
                <h3 className="note-card__title">{note.title}</h3>
                <span className={`badge badge--${note.detectorType.toLowerCase().replace('_', '-')}`}>
                    {TYPE_ICONS[note.detectorType as InputType]}
                    {TYPE_LABELS[note.detectorType as InputType]}
                </span>
            </div>

            <p className="note-card__summary">{note.summary}</p>

            <div className="note-card__footer">
                <div className="note-card__tags">
                    {note.autoTags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="tag note-tag">#{tag}</span>
                    ))}
                    {note.autoTags.length > 2 && (
                        <span className="tag">+{note.autoTags.length - 2}</span>
                    )}
                </div>
                <span className="note-card__date">{dateStr}</span>
            </div>
        </div>
    );
}
