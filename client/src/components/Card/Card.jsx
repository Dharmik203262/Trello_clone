import { Draggable } from '@hello-pangea/dnd';
import { format, isPast, isToday } from 'date-fns';

function Card({ card, index, onClick, style }) {
    // Calculate checklist progress
    const getChecklistProgress = () => {
        if (!card.checklists || card.checklists.length === 0) return null;

        const allItems = card.checklists.flatMap(checklist => checklist.items);
        const completedItems = allItems.filter(item => item.completed).length;
        const totalItems = allItems.length;

        return { completed: completedItems, total: totalItems };
    };

    const checklistProgress = getChecklistProgress();
    const isChecklistComplete = checklistProgress && checklistProgress.completed === checklistProgress.total;

    // Due date styling
    const getDueDateClass = () => {
        if (!card.dueDate) return '';

        const dueDate = new Date(card.dueDate);
        if (isChecklistComplete) return 'bg-green-600';
        if (isPast(dueDate) && !isToday(dueDate)) return 'bg-red-600';
        if (isToday(dueDate)) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    return (
        <Draggable draggableId={`card-${card.id}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    data-drag-type="card"
                    onClick={(e) => {
                        // Prevent click during drag operations
                        if (snapshot.isDragging || snapshot.isDropAnimating) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }
                        // Double click to open modal, or delay single click
                        if (onClick) {
                            onClick(e);
                        }
                    }}
                    onMouseDown={(e) => {
                        // Stop event from bubbling to parent (list) drag handle
                        e.stopPropagation();
                        // Mark this as a card drag, not a list drag
                        e.currentTarget.setAttribute('data-dragging-card', 'true');
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.removeAttribute('data-dragging-card');
                    }}
                    style={{
                        ...provided.draggableProps.style,
                        ...style,
                        opacity: snapshot.isDragging ? 0.5 : (style?.opacity ?? 1),
                        transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} rotate(2deg)` : provided.draggableProps.style?.transform,
                        cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                        touchAction: 'none'
                    }}
                    className={`
                        bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-2 sm:p-3 border border-gray-200 block cursor-grab
                        ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-blue-500 z-50 cursor-grabbing' : ''}
                    `}
                    onMouseEnter={(e) => {
                        // Ensure card cursor is grab when hovering
                        if (!snapshot.isDragging) {
                            e.currentTarget.style.cursor = 'grab';
                        }
                    }}
                >
                    {/* Labels */}
                    {card.labels && card.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {card.labels.map(({ label }) => (
                                <div
                                    key={label.id}
                                    className="h-2 w-10 rounded-sm"
                                    style={{ backgroundColor: label.color }}
                                    title={label.name}
                                />
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h4 className="text-sm font-medium text-gray-900 mb-3 leading-snug">{card.title}</h4>

                    {/* Metadata */}
                    <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500">
                        {/* Due Date */}
                        {card.dueDate && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-white ${getDueDateClass()}`}>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-medium">{format(new Date(card.dueDate), 'MMM d')}</span>
                            </div>
                        )}

                        {/* Description Indicator */}
                        {card.description && (
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v1H7V5zm0 3h6v1H7V8zm0 3h6v1H7v-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}

                        {/* Attachments Indicator */}
                        {card.attachments && card.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                </svg>
                                <span>{card.attachments.length}</span>
                            </div>
                        )}

                        {/* Checklist Indicator */}
                        {checklistProgress && (
                            <div className={`flex items-center gap-1 ${isChecklistComplete ? 'text-green-600' : ''}`}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                                <span>{checklistProgress.completed}/{checklistProgress.total}</span>
                            </div>
                        )}

                        {/* Members */}
                        {card.members && card.members.length > 0 && (
                            <div className="flex -space-x-1 ml-auto">
                                {card.members.map((member) => (
                                    <div
                                        key={member.member.id}
                                        className="h-5 w-5 rounded-full ring-2 ring-white flex items-center justify-center text-white text-[8px] font-bold"
                                        style={{ backgroundColor: member.member.avatarColor || '#6B7280' }}
                                        title={member.member.name}
                                    >
                                        {member.member.initials}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}

export default Card;
