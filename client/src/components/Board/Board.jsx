import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { boardAPI, listAPI, cardAPI, labelAPI, memberAPI } from '../../services/api';
import List from '../List/List';
import Card from '../Card/Card';
import CardModal from '../CardModal/CardModal';
import SearchFilter from '../SearchFilter/SearchFilter';

function Board() {
    const { id } = useParams();
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [activeCard, setActiveCard] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showCardModal, setShowCardModal] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const [isAddingList, setIsAddingList] = useState(false);
    const [allMembers, setAllMembers] = useState([]);
    const [allLabels, setAllLabels] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ labels: [], members: [], dueDate: '' });

    // Load board data
    useEffect(() => {
        loadBoard();
        loadLabelsAndMembers();
    }, [id]);

    const loadLabelsAndMembers = async () => {
        try {
            const boardId = id || 1;
            const [labelsRes, membersRes] = await Promise.all([
                labelAPI.getAll(boardId),
                memberAPI.getAll()
            ]);
            setAllLabels(labelsRes.data || []);
            setAllMembers(membersRes.data || []);
        } catch (error) {
            console.error('Error loading labels/members:', error);
        }
    };

    const loadBoard = async () => {
        try {
            const boardId = id || 1; // Default to board 1
            const response = await boardAPI.getById(boardId);
            setBoard(response.data);
            setLists(response.data.lists || []);
        } catch (error) {
            console.error('Error loading board:', error);
        }
    };

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId, type } = result;

        console.log('Drag end:', { destination, source, draggableId, type });

        // No destination (dropped outside)
        if (!destination) {
            console.log('No destination - drag cancelled');
            return;
        }

        // Dropped in same place
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // --- Reordering Lists ---
        if (type === 'list') {
            const newLists = [...listsForDrag];
            const [removed] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, removed);
            setLists(newLists);

            try {
                const updatedLists = newLists.map((list, index) => ({
                    id: parseInt(list.id),
                    position: parseInt(index)
                }));
                console.log('Sending list reorder request:', updatedLists);
                await listAPI.reorder(updatedLists);
            } catch (error) {
                console.error('Error reordering lists:', error);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                }
                loadBoard(); // Revert on error
            }
            return;
        }

        // --- Moving Cards ---
        if (type === 'card') {
            // Use unfiltered lists to find source and destination
            const sourceList = listsForDrag.find(list => list.id.toString() === source.droppableId);
            const destList = listsForDrag.find(list => list.id.toString() === destination.droppableId);

            if (!sourceList || !destList) {
                console.error('Source or destination list not found', { source, destination });
                return;
            }

            // 1. Moving within the same list
            if (sourceList.id === destList.id) {
                const newCards = [...sourceList.cards];
                const [movedCard] = newCards.splice(source.index, 1);
                newCards.splice(destination.index, 0, movedCard);

                const newLists = listsForDrag.map(list => {
                    if (list.id === sourceList.id) {
                        return { ...list, cards: newCards };
                    }
                    return list;
                });

                setLists(newLists);

                try {
                    // Extract numeric ID from prefixed draggableId (e.g., 'card-123' -> 123)
                    const cardId = parseInt(draggableId.replace('card-', ''));
                    await cardAPI.move({
                        cardId: cardId,
                        sourceListId: sourceList.id,
                        destListId: sourceList.id,
                        sourcePosition: source.index,
                        destPosition: destination.index
                    });
                } catch (error) {
                    console.error('Error moving card same list:', error);
                    loadBoard();
                }
            } else {
                // 2. Moving to a different list
                const sourceCards = [...sourceList.cards];
                const destCards = [...destList.cards];
                const [movedCard] = sourceCards.splice(source.index, 1);

                // Update the card's listId conceptually (for the frontend state)
                movedCard.listId = destList.id;

                destCards.splice(destination.index, 0, movedCard);

                const newLists = listsForDrag.map(list => {
                    if (list.id === sourceList.id) {
                        return { ...list, cards: sourceCards };
                    }
                    if (list.id === destList.id) {
                        return { ...list, cards: destCards };
                    }
                    return list;
                });

                setLists(newLists);

                try {
                    // Extract numeric ID from prefixed draggableId (e.g., 'card-123' -> 123)
                    const cardId = parseInt(draggableId.replace('card-', ''));
                    await cardAPI.move({
                        cardId: cardId,
                        sourceListId: sourceList.id,
                        destListId: destList.id,
                        sourcePosition: source.index,
                        destPosition: destination.index
                    });
                } catch (error) {
                    console.error('Error moving card different list:', error);
                    loadBoard();
                }
            }
        }
    };

    // Create new list
    const handleCreateList = async () => {
        if (!newListTitle.trim()) return;

        try {
            const response = await listAPI.create({
                boardId: board.id,
                title: newListTitle
            });

            setLists([...lists, { ...response.data, cards: [] }]);
            setNewListTitle('');
            setIsAddingList(false);
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    // Handle card click to open modal
    const handleCardClick = (card) => {
        setSelectedCard(card);
        setShowCardModal(true);
    };

    const handleCardUpdated = () => {
        loadBoard();
    };

    // Filter cards based on search and filters
    const filterCards = (card) => {
        // Search filter
        if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Label filter
        if (filters.labels.length > 0) {
            const cardLabelIds = card.labels?.map(cl => cl.label.id) || [];
            const hasMatchingLabel = filters.labels.some(labelId => cardLabelIds.includes(labelId));
            if (!hasMatchingLabel) return false;
        }

        // Member filter
        if (filters.members.length > 0) {
            const cardMemberIds = card.members?.map(cm => cm.member.id) || [];
            const hasMatchingMember = filters.members.some(memberId => cardMemberIds.includes(memberId));
            if (!hasMatchingMember) return false;
        }

        // Due date filter
        if (filters.dueDate) {
            if (filters.dueDate === 'no-date') {
                if (card.dueDate) return false;
            } else if (filters.dueDate === 'overdue') {
                if (!card.dueDate) return false;
                const dueDate = new Date(card.dueDate);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                if (dueDate >= now) return false;
            } else if (filters.dueDate === 'today') {
                if (!card.dueDate) return false;
                const dueDate = new Date(card.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (dueDate.toDateString() !== today.toDateString()) return false;
            } else if (filters.dueDate === 'week') {
                if (!card.dueDate) return false;
                const dueDate = new Date(card.dueDate);
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                if (dueDate > weekFromNow) return false;
            } else if (filters.dueDate === 'month') {
                if (!card.dueDate) return false;
                const dueDate = new Date(card.dueDate);
                const monthFromNow = new Date();
                monthFromNow.setMonth(monthFromNow.getMonth() + 1);
                if (dueDate > monthFromNow) return false;
            }
        }

        return true;
    };

    // Use unfiltered lists for drag operations to maintain correct indices
    // Filtering is applied visually in the List component
    const listsForDrag = lists;

    if (!board) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col h-screen"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
            {/* Header */}
            <div className="bg-black bg-opacity-20 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-sm border-b border-white border-opacity-10 flex-shrink-0 relative z-10">
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                    {/* Left: Board Title */}
                    <div className="flex items-center min-w-0">
                        <h1 className="text-base sm:text-xl font-bold text-white truncate">{board.title}</h1>
                    </div>

                    {/* Center: Search Bar */}
                    <div className="flex-1 max-w-3xl mx-2 sm:mx-4 flex justify-center">
                        <SearchFilter
                            boardId={board.id}
                            onSearch={setSearchQuery}
                            onFilter={setFilters}
                            availableLabels={allLabels}
                            availableMembers={allMembers}
                        />
                    </div>

                    {/* Right: Additional controls can go here */}
                    <div className="flex items-center space-x-2">
                        {/* Empty for now, can add avatar, menu, etc. */}
                    </div>
                </div>
            </div>

            {/* Board Content - Single scroll container to avoid nested scroll issues with @hello-pangea/dnd */}
            <DragDropContext
                onDragEnd={handleDragEnd}
                onDragStart={(start) => {
                    console.log('Drag start:', start);
                }}
                onDragUpdate={(update) => {
                    console.log('Drag update:', update);
                }}
            >
                <Droppable droppableId="all-lists" direction="horizontal" type="list">
                    {(provided, snapshot) => (
                        <div
                            className={`flex-1 p-2 sm:p-4 overflow-x-auto overflow-y-hidden flex flex-row gap-3 pb-4 items-start ${snapshot.isDraggingOver ? 'bg-white bg-opacity-5' : ''
                                }`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ minHeight: 'calc(100vh - 80px)' }}
                        >
                            {listsForDrag.map((list, index) => (
                                <List
                                    key={list.id}
                                    list={list}
                                    index={index}
                                    onCardClick={handleCardClick}
                                    onUpdate={loadBoard}
                                    filterCards={filterCards}
                                />
                            ))}
                            {provided.placeholder}

                            {/* Add List */}
                            <div className="w-full md:w-72 flex-shrink-0">
                                {isAddingList ? (
                                    <div className="bg-black bg-opacity-25 backdrop-blur-sm rounded-list p-3">
                                        <input
                                            type="text"
                                            placeholder="Enter list title..."
                                            value={newListTitle}
                                            onChange={(e) => setNewListTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCreateList();
                                                if (e.key === 'Escape') setIsAddingList(false);
                                            }}
                                            className="input-field mb-2"
                                            autoFocus
                                        />
                                        <div className="flex space-x-2">
                                            <button onClick={handleCreateList} className="btn-primary text-sm">
                                                Add List
                                            </button>
                                            <button onClick={() => setIsAddingList(false)} className="btn-secondary text-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingList(true)}
                                        className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-3 rounded-list transition-all font-semibold text-sm"
                                    >
                                        + Add another list
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Card Detail Modal */}
            {showCardModal && selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => {
                        setShowCardModal(false);
                        setSelectedCard(null);
                    }}
                    onUpdate={handleCardUpdated}
                    boardId={board.id}
                />
            )}
        </div>
    );
}

export default Board;

