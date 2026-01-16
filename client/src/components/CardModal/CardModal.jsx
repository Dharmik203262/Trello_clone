import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cardAPI, labelAPI, memberAPI, checklistAPI } from '../../services/api';

function CardModal({ card, onClose, onUpdate, boardId }) {
    const [cardData, setCardData] = useState(card);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : '');
    const [availableLabels, setAvailableLabels] = useState([]);
    const [availableMembers, setAvailableMembers] = useState([]);
    const [newChecklistTitle, setNewChecklistTitle] = useState('');
    const [isAddingChecklist, setIsAddingChecklist] = useState(false);
    const [newItemText, setNewItemText] = useState({});

    useEffect(() => {
        loadLabels();
        loadMembers();
    }, []);

    const loadLabels = async () => {
        try {
            const response = await labelAPI.getAll(boardId);
            setAvailableLabels(response.data);
        } catch (error) {
            console.error('Error loading labels:', error);
        }
    };

    const loadMembers = async () => {
        try {
            const response = await memberAPI.getAll();
            setAvailableMembers(response.data);
        } catch (error) {
            console.error('Error loading members:', error);
        }
    };

    const handleUpdateTitle = async () => {
        if (title.trim() && title !== cardData.title) {
            try {
                await cardAPI.update(cardData.id, { title });
                setCardData({ ...cardData, title });
                onUpdate();
            } catch (error) {
                console.error('Error updating title:', error);
            }
        }
        setIsEditingTitle(false);
    };

    const handleUpdateDescription = async () => {
        try {
            await cardAPI.update(cardData.id, { description });
            setCardData({ ...cardData, description });
            setIsEditingDescription(false);
            onUpdate();
        } catch (error) {
            console.error('Error updating description:', error);
        }
    };

    const handleUpdateDueDate = async (e) => {
        const newDate = e.target.value;
        setDueDate(newDate);

        try {
            await cardAPI.update(cardData.id, { dueDate: newDate || null });
            onUpdate();
        } catch (error) {
            console.error('Error updating due date:', error);
        }
    };

    const handleToggleLabel = async (labelId) => {
        const hasLabel = cardData.labels?.some(cl => cl.label.id === labelId);

        try {
            if (hasLabel) {
                await labelAPI.removeFromCard(cardData.id, labelId);
            } else {
                await labelAPI.addToCard(cardData.id, labelId);
            }
            onUpdate();
            // Refresh card data
            const response = await cardAPI.update(cardData.id, {});
            setCardData(response.data);
        } catch (error) {
            console.error('Error toggling label:', error);
        }
    };

    const handleToggleMember = async (memberId) => {
        const hasMember = cardData.members?.some(cm => cm.member.id === memberId);

        try {
            if (hasMember) {
                await memberAPI.removeFromCard(cardData.id, memberId);
            } else {
                await memberAPI.addToCard(cardData.id, memberId);
            }
            onUpdate();
            // Refresh card data
            const response = await cardAPI.update(cardData.id, {});
            setCardData(response.data);
        } catch (error) {
            console.error('Error toggling member:', error);
        }
    };

    const handleAddChecklist = async () => {
        if (!newChecklistTitle.trim()) return;

        try {
            await checklistAPI.create({
                cardId: cardData.id,
                title: newChecklistTitle
            });
            setNewChecklistTitle('');
            setIsAddingChecklist(false);
            onUpdate();
            // Refresh card data
            const response = await cardAPI.update(cardData.id, {});
            setCardData(response.data);
        } catch (error) {
            console.error('Error adding checklist:', error);
        }
    };

    const handleAddChecklistItem = async (checklistId) => {
        const text = newItemText[checklistId];
        if (!text?.trim()) return;

        try {
            await checklistAPI.addItem(checklistId, { text });
            setNewItemText({ ...newItemText, [checklistId]: '' });
            onUpdate();
            // Refresh card data
            const response = await cardAPI.update(cardData.id, {});
            setCardData(response.data);
        } catch (error) {
            console.error('Error adding checklist item:', error);
        }
    };

    const handleToggleChecklistItem = async (itemId, completed) => {
        try {
            await checklistAPI.updateItem(itemId, { completed: !completed });
            onUpdate();
            // Refresh card data
            const response = await cardAPI.update(cardData.id, {});
            setCardData(response.data);
        } catch (error) {
            console.error('Error toggling item:', error);
        }
    };

    const handleDeleteChecklist = async (checklistId) => {
        if (!confirm('Delete checklist?')) return;

        try {
            await checklistAPI.delete(checklistId);
            onUpdate();
            const response = await cardAPI.update(cardData.id, {});
            setCardData(response.data);
        } catch (error) {
            console.error('Error deleting checklist:', error);
        }
    };

    const handleArchiveCard = async () => {
        try {
            await cardAPI.archive(cardData.id, true);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error archiving card:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-modal w-full max-w-3xl mx-2 sm:mx-4 mb-4 sm:mb-8 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-4 sm:p-6">
                    {/* Title */}
                    <div className="flex items-start mb-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={handleUpdateTitle}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateTitle();
                                        if (e.key === 'Escape') setIsEditingTitle(false);
                                    }}
                                    className="input-field text-lg sm:text-xl font-semibold"
                                    autoFocus
                                />
                            ) : (
                                <h2
                                    onClick={() => setIsEditingTitle(true)}
                                    className="text-lg sm:text-xl font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded break-words"
                                >
                                    {cardData.title}
                                </h2>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-2 sm:ml-4 p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            {/* Labels */}
                            {cardData.labels && cardData.labels.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold mb-2">Labels</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {cardData.labels.map(({ label }) => (
                                            <span
                                                key={label.id}
                                                className="label-badge px-3"
                                                style={{ backgroundColor: label.color }}
                                            >
                                                {label.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-semibold mb-2 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v1H7V5zm0 3h6v1H7V8zm0 3h6v1H7v-1z" clipRule="evenodd" />
                                    </svg>
                                    Description
                                </h3>
                                {isEditingDescription ? (
                                    <div>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="textarea-field"
                                            rows="5"
                                            placeholder="Add a more detailed description..."
                                            autoFocus
                                        />
                                        <div className="flex space-x-2 mt-2">
                                            <button onClick={handleUpdateDescription} className="btn-primary text-sm">
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDescription(cardData.description || '');
                                                    setIsEditingDescription(false);
                                                }}
                                                className="btn-secondary text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingDescription(true)}
                                        className="min-h-[60px] p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                                    >
                                        {description || <span className="text-gray-500">Add a more detailed description...</span>}
                                    </div>
                                )}
                            </div>

                            {/* Checklists */}
                            {cardData.checklists && cardData.checklists.length > 0 && (
                                <div className="space-y-4">
                                    {cardData.checklists.map((checklist) => {
                                        const completed = checklist.items.filter(i => i.completed).length;
                                        const total = checklist.items.length;
                                        const progress = total > 0 ? (completed / total) * 100 : 0;

                                        return (
                                            <div key={checklist.id}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-sm font-semibold flex items-center">
                                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        {checklist.title}
                                                    </h3>
                                                    <button
                                                        onClick={() => handleDeleteChecklist(checklist.id)}
                                                        className="text-sm text-red-600 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${progress === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Checklist Items */}
                                                <div className="space-y-2">
                                                    {checklist.items.map((item) => (
                                                        <div key={item.id} className="flex items-start">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.completed}
                                                                onChange={() => handleToggleChecklistItem(item.id, item.completed)}
                                                                className="mt-1 mr-2 w-4 h-4 cursor-pointer"
                                                            />
                                                            <span className={item.completed ? 'line-through text-gray-500' : ''}>
                                                                {item.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Item */}
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        value={newItemText[checklist.id] || ''}
                                                        onChange={(e) => setNewItemText({ ...newItemText, [checklist.id]: e.target.value })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleAddChecklistItem(checklist.id);
                                                        }}
                                                        placeholder="Add an item"
                                                        className="input-field text-sm"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Sidebar Actions */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Add to card</h4>

                                {/* Labels */}
                                <div className="mb-2">
                                    <h5 className="text-sm font-medium mb-1">Labels</h5>
                                    <div className="space-y-1">
                                        {availableLabels.map((label) => {
                                            const isActive = cardData.labels?.some(cl => cl.label.id === label.id);
                                            return (
                                                <button
                                                    key={label.id}
                                                    onClick={() => handleToggleLabel(label.id)}
                                                    className={`w-full text-left px-3 py-2 rounded text-white text-sm font-medium ${isActive ? 'ring-2 ring-black' : ''}`}
                                                    style={{ backgroundColor: label.color }}
                                                >
                                                    {label.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Members */}
                                <div className="mb-2">
                                    <h5 className="text-sm font-medium mb-1">Members</h5>
                                    <div className="space-y-1">
                                        {availableMembers.map((member) => {
                                            const isActive = cardData.members?.some(cm => cm.member.id === member.id);
                                            return (
                                                <button
                                                    key={member.id}
                                                    onClick={() => handleToggleMember(member.id)}
                                                    className={`w-full flex items-center px-3 py-2 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200' : ''}`}
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2"
                                                        style={{ backgroundColor: member.avatarColor }}
                                                    >
                                                        {member.initials}
                                                    </div>
                                                    <span className="text-sm">{member.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div className="mb-2">
                                    <h5 className="text-sm font-medium mb-1">Due Date</h5>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={handleUpdateDueDate}
                                        className="input-field text-sm"
                                    />
                                </div>

                                {/* Checklist */}
                                <div className="mb-2">
                                    <h5 className="text-sm font-medium mb-1">Checklist</h5>
                                    {isAddingChecklist ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={newChecklistTitle}
                                                onChange={(e) => setNewChecklistTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAddChecklist();
                                                    if (e.key === 'Escape') setIsAddingChecklist(false);
                                                }}
                                                placeholder="Checklist title"
                                                className="input-field text-sm mb-2"
                                                autoFocus
                                            />
                                            <div className="flex space-x-2">
                                                <button onClick={handleAddChecklist} className="btn-primary text-sm">
                                                    Add
                                                </button>
                                                <button onClick={() => setIsAddingChecklist(false)} className="btn-secondary text-sm">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsAddingChecklist(true)}
                                            className="w-full btn-secondary text-sm"
                                        >
                                            Add Checklist
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Actions</h4>
                                <button onClick={handleArchiveCard} className="w-full btn-secondary text-sm">
                                    Archive
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardModal;
