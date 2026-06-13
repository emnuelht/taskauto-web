import { useState } from 'react';
import type { GroupResponse } from '../types/group.types';
import { addGroup, deleteGroup, updateGroup } from '../api/groups.api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import {
    FolderOpen,
    Trash2,
    Plus,
    Sun,
    Moon
} from 'lucide-react';
import './Sidebar.css';
import './Modal.css';

interface SidebarProps {
    groups: GroupResponse[];
    activeGroupId: string | null;
    onSelectGroup: (id: string) => void;
    onGroupsChange: () => void;
}

const GROUP_ICON_COLORS = [
    'var(--accent-2)',
    '#34d399',
    '#fbbf24',
    '#f87171',
    '#a78bfa',
    '#38bdf8',
    '#fb923c',
    '#e879f9',
];

export default function Sidebar({ groups, activeGroupId, onSelectGroup, onGroupsChange }: SidebarProps) {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const [adding, setAdding] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [loadingAction, setLoadingAction] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

    const handleAddGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        setLoadingAction(true);
        try {
            await addGroup({ groupName: newGroupName.trim() });
            setNewGroupName('');
            setAdding(false);
            onGroupsChange();
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, groupId: string) => {
        e.stopPropagation();
        setGroupToDelete(groupId);
    };

    const confirmDelete = async () => {
        if (!groupToDelete) return;
        setLoadingAction(true);
        try {
            await deleteGroup(groupToDelete);
            onGroupsChange();
            if (activeGroupId === groupToDelete) navigate('/');
        } finally {
            setLoadingAction(false);
            setGroupToDelete(null);
        }
    };

    const handleEdit = async (e: React.FormEvent, groupId: string) => {
        e.preventDefault();
        if (!editName.trim()) return;
        setLoadingAction(true);
        try {
            await updateGroup({ groupId, groupName: editName.trim() });
            setEditingId(null);
            onGroupsChange();
        } finally {
            setLoadingAction(false);
        }
    };

    const getIconColor = (index: number) => GROUP_ICON_COLORS[index % GROUP_ICON_COLORS.length];

    return (
        <aside className="sidebar">
            <div className="sidebar__header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div className="sidebar__logo" style={{ marginBottom: 0 }}>
                        <span className="sidebar__logo-text">TaskAuto</span>
                    </div>
                    <button
                        id="theme-toggle-btn"
                        className="btn-icon"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                        style={{ padding: 6 }}
                    >
                        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                    </button>
                </div>
            </div>

            <p className="sidebar__section-title">Grupos</p>

            <div className="sidebar__groups">
                {groups.map((group, index) => (
                    <div key={group.id} style={index > 0 ? { marginTop: "10px" } : {}}>
                        {editingId === group.id ? (
                            <form onSubmit={(e) => handleEdit(e, group.id)} style={{ padding: '4px 12px' }}>
                                <input
                                    id={`edit-group-${group.id}`}
                                    className="form__input"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    autoFocus
                                    onBlur={() => setEditingId(null)}
                                    style={{ fontSize: 13 }}
                                />
                            </form>
                        ) : (
                            <div
                                id={`group-item-${group.id}`}
                                className={`sidebar__group-item ${activeGroupId === group.id ? 'sidebar__group-item--active' : ''}`}
                                onClick={() => onSelectGroup(group.id)}
                                onDoubleClick={() => { setEditingId(group.id); setEditName(group.name); }}
                                title="Duplo clique para renomear"
                            >
                                <div className="sidebar__group-icon">
                                    <FolderOpen
                                        size={15}
                                        color={activeGroupId === group.id ? 'var(--accent-2)' : getIconColor(index)}
                                        strokeWidth={1.75}
                                    />
                                </div>
                                <span className="sidebar__group-name">{group.name}</span>
                                <span className="sidebar__group-count">{group.notes.length}</span>
                                <button
                                    id={`delete-group-${group.id}`}
                                    className="sidebar__group-delete-btn"
                                    onClick={(e) => handleDelete(e, group.id)}
                                    title="Deletar grupo"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {adding ? (
                    <form onSubmit={handleAddGroup} style={{ padding: '4px 10px' }}>
                        <input
                            id="new-group-input"
                            className="form__input"
                            placeholder="Nome do grupo..."
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            autoFocus
                            onBlur={() => { if (!newGroupName.trim()) setAdding(false); }}
                            disabled={loadingAction}
                            style={{ fontSize: 13 }}
                        />
                    </form>
                ) : (
                    <button
                        id="add-group-btn"
                        className="sidebar__add-group"
                        onClick={() => setAdding(true)}
                    >
                        <Plus size={15} /> Novo grupo
                    </button>
                )}
            </div>

            {groupToDelete && (
                <div className="modal__backdrop" onClick={() => !loadingAction && setGroupToDelete(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal__header">
                            <h3 className="modal__title">Confirmar Exclusão</h3>
                            <button className="modal__close" onClick={() => setGroupToDelete(null)} disabled={loadingAction}>&times;</button>
                        </div>
                        <div className="modal__body">
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Tem certeza que deseja deletar este grupo e todas as suas notas? Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--ghost" onClick={() => setGroupToDelete(null)} disabled={loadingAction}>Cancelar</button>
                            <button className="btn" style={{ background: '#f87171', color: '#fff', borderColor: '#f87171' }} onClick={confirmDelete} disabled={loadingAction}>
                                {loadingAction ? 'Deletando...' : 'Deletar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
