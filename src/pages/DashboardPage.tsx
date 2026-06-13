import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroups } from '../api/groups.api';
import { getNotes } from '../api/notes.api';
import type { GroupResponse } from '../types/group.types';
import type { NoteResponse } from '../types/note.types';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NoteDetailModal from '../components/NoteDetailModal';
import AIInputModal from '../components/AIInputModal';
import { Bot, Zap, FileText, AlertTriangle, ArrowLeft } from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
    const { groupId } = useParams<{ groupId?: string }>();
    const navigate = useNavigate();

    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [notes, setNotes] = useState<NoteResponse[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [selectedNote, setSelectedNote] = useState<NoteResponse | null>(null);
    const [showAIModal, setShowAIModal] = useState(false);
    const [error, setError] = useState('');

    const loadGroups = useCallback(async () => {
        try {
            const data = await getGroups();
            setGroups(data);
        } catch {
            setError('Erro ao carregar grupos.');
        } finally {
            setLoadingGroups(false);
        }
    }, []);

    useEffect(() => { loadGroups(); }, [loadGroups]);

    useEffect(() => {
        if (!groupId) { setNotes([]); return; }
        setLoadingNotes(true);
        setError('');
        getNotes(groupId)
            .then(setNotes)
            .catch(() => setError('Erro ao carregar notas.'))
            .finally(() => setLoadingNotes(false));
    }, [groupId]);

    const handleSelectGroup = (id: string) => navigate(`/group/${id}`);

    const activeGroup = groups.find((g) => g.id === groupId) ?? null;

    if (loadingGroups) {
        return (
            <div className="loading-screen">
                <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</span>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar
                groups={groups}
                activeGroupId={groupId ?? null}
                onSelectGroup={handleSelectGroup}
                onGroupsChange={loadGroups}
            />

            <main className="app-layout__main-content">
                {!groupId ? (
                    <div className="dashboard-welcome">
                        <div className="dashboard-welcome__icon">
                            <Zap size={64} color="var(--accent-2)" strokeWidth={1.5} />
                        </div>
                        <h1 className="dashboard-welcome__title">Bem-vindo ao TaskAuto</h1>
                        <p className="dashboard-welcome__desc">
                            Selecione um grupo na barra lateral ou crie um novo para começar a organizar suas notas com inteligência artificial.
                        </p>
                        {groups.length === 0 && (
                            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                                <ArrowLeft size={14} /> Clique em "Novo grupo" para começar
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="page-header">
                            <div>
                                <h1 className="page-header__title">{activeGroup?.name ?? 'Notas'}</h1>
                                <p className="page-header__subtitle">
                                    {loadingNotes ? 'Carregando...' : `${notes.length} ${notes.length === 1 ? 'nota' : 'notas'}`}
                                </p>
                            </div>
                            <button
                                id="new-ai-note-btn"
                                className="btn btn--primary"
                                onClick={() => setShowAIModal(true)}
                            >
                                <Bot size={15} /> Nova nota com IA
                            </button>
                        </div>

                        {error && (
                            <div className="error-msg" style={{ margin: '0 32px 16px' }}>
                                <AlertTriangle size={15} /> {error}
                            </div>
                        )}

                        {loadingNotes ? (
                            <div className="loading-screen" style={{ height: 'auto', padding: '60px 0' }}>
                                <div className="spinner" />
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state__icon">
                                    <FileText size={56} color="var(--text-muted)" strokeWidth={1} />
                                </div>
                                <p className="empty-state__title">Nenhuma nota ainda</p>
                                <p className="empty-state__desc">
                                    Clique em "Nova nota com IA" e descreva sua tarefa ou ideia em linguagem natural.
                                </p>
                                <button
                                    id="empty-state-ai-btn"
                                    className="btn btn--primary"
                                    onClick={() => setShowAIModal(true)}
                                >
                                    <Bot size={15} /> Criar primeira nota
                                </button>
                            </div>
                        ) : (
                            <div className="notes-grid">
                                {notes.map((note) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onClick={() => setSelectedNote(note)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {selectedNote && groupId && (
                <NoteDetailModal
                    note={selectedNote}
                    groupId={groupId}
                    onClose={() => setSelectedNote(null)}
                    onDeleted={() => getNotes(groupId).then(setNotes)}
                />
            )}

            {showAIModal && groupId && (
                <AIInputModal
                    groupId={groupId}
                    onClose={() => setShowAIModal(false)}
                    onSaved={() => getNotes(groupId).then(setNotes)}
                />
            )}
        </div>
    );
}
