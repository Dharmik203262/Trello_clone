import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import Card from '../Card/Card';
import { listAPI, cardAPI } from '../../services/api';

function List({ list, index, onCardClick, onUpdate, filterCards }) {
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(list.title);
    const [showMenu, setShowMenu] = useState(false);

    const handleCreateCard = async () => {
        if (!newCardTitle.trim()) return;

        try {
            await cardAPI.create({
                listId: list.id,
                title: newCardTitle
            });

            setNewCardTitle('');
            setIsAddingCard(false);
            onUpdate();
        } catch (error) {
            console.error('Error creating card:', error);
        }
    };

    const handleUpdateTitle = async () => {
        if (!editedTitle.trim() || editedTitle === list.title) {
            setIsEditingTitle(false);
            return;
        }

        try {
            await listAPI.update(list.id, { title: editedTitle });
            setIsEditingTitle(false);
            onUpdate();
        } catch (error) {
            console.error('Error updating list:', error);
            setEditedTitle(list.title);
        }
    };

    const handleDeleteList = async () => {
        if (!confirm('Are you sure you want to delete this list?')) return;

        try {
            await listAPI.delete(list.id);
            onUpdate();
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    return (
        <Draggable draggableId={`list-${list.id}`} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex-shrink-0 w-full sm:w-80 md:w-72"
                >
                    <div className="bg-black bg-opacity-25 backdrop-blur-sm rounded-list shadow-list-dark flex flex-col">
                        {/* List Header */}
                        <div className="p-2">
                            <div className="flex items-center justify-between mb-1">
                                {/* Drag Handle */}
                                <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing p-1 mr-1 text-white text-opacity-50 hover:text-opacity-100"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                                    </svg>
                                </div>
                                {isEditingTitle ? (
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        onBlur={handleUpdateTitle}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUpdateTitle();
                                            if (e.key === 'Escape') {
                                                setEditedTitle(list.title);
                                                setIsEditingTitle(false);
                                            }
                                        }}
                                        className="w-full px-2 py-1 text-sm font-semibold rounded border border-blue-500 focus:outline-none"
                                        autoFocus
                                    />
                                ) : (
                                    <h3
                                        onClick={() => setIsEditingTitle(true)}
                                        className="text-white font-semibold text-sm px-2 py-1 rounded cursor-pointer hover:bg-white hover:bg-opacity-20 flex-1 truncate select-none"
                                    >
                                        {list.title}
                                    </h3>
                                )}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </button>
                                    {showMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowMenu(false)}
                                            />
                                            <div className="absolute right-0 top-8 bg-white rounded shadow-xl z-20 w-40 py-1">
                                                <button
                                                    onClick={handleDeleteList}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                >
                                                    Delete List
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cards - No overflow-y-auto to avoid nested scroll container issue */}
                        <div className="min-h-[50px] px-2 pb-2">
                            <Droppable droppableId={list.id.toString()} type="card">
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`min-h-[50px] ${snapshot.isDraggingOver ? 'bg-white bg-opacity-10 rounded' : ''
                                            }`}
                                    >
                                        {list.cards.length === 0 ? (
                                            <div className="min-h-[50px] py-2 flex items-center justify-center">
                                                <div className="text-white text-opacity-50 text-xs">Drop cards here</div>
                                            </div>
                                        ) : (
                                            list.cards.map((card, cardIndex) => {
                                                // Apply filter for visual display while keeping all cards in drag system
                                                const shouldShow = !filterCards || filterCards(card);
                                                return (
                                                    <Card
                                                        key={card.id}
                                                        card={card}
                                                        index={cardIndex}
                                                        onClick={() => shouldShow ? onCardClick(card) : undefined}
                                                        style={{
                                                            opacity: shouldShow ? 1 : 0.3,
                                                            marginBottom: '8px'
                                                        }}
                                                    />
                                                );
                                            })
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>

                        {/* Add Card Footer */}
                        <div className="p-2 pt-0">
                            {isAddingCard ? (
                                <div className="mt-2">
                                    <textarea
                                        placeholder="Enter a title for this card..."
                                        className="w-full p-2 mb-2 text-sm rounded border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-16 resize-none"
                                        value={newCardTitle}
                                        onChange={(e) => setNewCardTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleCreateCard();
                                            }
                                            if (e.key === 'Escape') setIsAddingCard(false);
                                        }}
                                        autoFocus
                                    />
                                    <div className="flex items-center space-x-2">
                                        <button onClick={handleCreateCard} className="btn-primary text-sm px-3 py-1.5">
                                            Add Card
                                        </button>
                                        <button
                                            onClick={() => setIsAddingCard(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingCard(true)}
                                    className="w-full text-left px-2 py-1.5 rounded hover:bg-white hover:bg-opacity-20 text-gray-300 hover:text-white text-sm flex items-center transition-colors mt-1"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add a card
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

export default List;
