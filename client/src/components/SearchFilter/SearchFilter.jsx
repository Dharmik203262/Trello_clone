import { useState, useEffect } from 'react';
import { labelAPI, memberAPI } from '../../services/api';

function SearchFilter({ boardId, onSearch, onFilter, availableLabels = [], availableMembers = [], centerSearch = false }) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [dueDateFilter, setDueDateFilter] = useState('');

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch(query);
    };

    const handleLabelToggle = (labelId) => {
        const newLabels = selectedLabels.includes(labelId)
            ? selectedLabels.filter(id => id !== labelId)
            : [...selectedLabels, labelId];

        setSelectedLabels(newLabels);
        updateFilters(newLabels, selectedMembers, dueDateFilter);
    };

    const handleMemberToggle = (memberId) => {
        const newMembers = selectedMembers.includes(memberId)
            ? selectedMembers.filter(id => id !== memberId)
            : [...selectedMembers, memberId];

        setSelectedMembers(newMembers);
        updateFilters(selectedLabels, newMembers, dueDateFilter);
    };

    const handleDueDateChange = (value) => {
        setDueDateFilter(value);
        updateFilters(selectedLabels, selectedMembers, value);
    };

    const updateFilters = (labels, members, dueDate) => {
        onFilter({
            labels,
            members,
            dueDate
        });
    };

    const handleClearFilters = () => {
        setSelectedLabels([]);
        setSelectedMembers([]);
        setDueDateFilter('');
        onFilter({ labels: [], members: [], dueDate: '' });
    };

    const hasActiveFilters = selectedLabels.length > 0 || selectedMembers.length > 0 || dueDateFilter;

    // Centered search bar layout (like Trello)
    if (centerSearch) {
        return (
            <div className="flex items-center justify-center gap-2 w-full">
                {/* Always visible search bar */}
                <div className="flex-1 max-w-lg">
                    <div className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded px-3 py-1.5 transition-all">
                        <svg className="w-4 h-4 text-white mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search..."
                            className="outline-none text-sm bg-transparent text-white placeholder-white placeholder-opacity-70 w-full"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    onSearch('');
                                }}
                                className="ml-2"
                            >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter button */}
                <div className="relative">
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className={`flex items - center space - x - 2 ${hasActiveFilters ? 'bg-blue-600' : 'bg-white bg-opacity-20'} hover: bg - opacity - 30 text - white px - 3 py - 1.5 rounded transition - all whitespace - nowrap`}
                        title="Filter"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium hidden sm:inline">Filter</span>
                        {hasActiveFilters && (
                            <span className="ml-1 bg-white text-blue-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
                                {selectedLabels.length + selectedMembers.length + (dueDateFilter ? 1 : 0)}
                            </span>
                        )}
                    </button>

                    {filterOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-[998]"
                                onClick={() => setFilterOpen(false)}
                            />

                            {/* Filter Dropdown */}
                            <div className="absolute right-0 top-12 bg-white rounded-lg shadow-modal p-4 z-[999] w-72 max-h-96 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                {/* Labels Filter */}
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Labels</h4>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {availableLabels.length > 0 ? (
                                            availableLabels.map((label) => (
                                                <button
                                                    key={label.id}
                                                    onClick={() => handleLabelToggle(label.id)}
                                                    className={`w - full text - left px - 3 py - 2 rounded flex items - center justify - between ${selectedLabels.includes(label.id) ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                                        } `}
                                                    style={{ backgroundColor: label.color }}
                                                >
                                                    <span className="text-white text-sm font-medium">{label.name}</span>
                                                    {selectedLabels.includes(label.id) && (
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-500 italic">No labels available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Members Filter */}
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Members</h4>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {availableMembers.length > 0 ? (
                                            availableMembers.map((member) => (
                                                <button
                                                    key={member.id}
                                                    onClick={() => handleMemberToggle(member.id)}
                                                    className={`w - full flex items - center px - 3 py - 2 rounded hover: bg - gray - 100 ${selectedMembers.includes(member.id) ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                                                        } `}
                                                >
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2"
                                                        style={{ backgroundColor: member.avatarColor }}
                                                    >
                                                        {member.initials}
                                                    </div>
                                                    <span className="text-sm flex-1 text-left">{member.name}</span>
                                                    {selectedMembers.includes(member.id) && (
                                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-500 italic">No members available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Due Date Filter */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Due Date</h4>
                                    <select
                                        value={dueDateFilter}
                                        onChange={(e) => handleDueDateChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All cards</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="today">Due today</option>
                                        <option value="week">Due this week</option>
                                        <option value="month">Due this month</option>
                                        <option value="no-date">No due date</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 relative w-full">
            {/* Search - Always visible */}
            <div className="flex-1 min-w-[400px] sm:min-w-[600px]">
                <div className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded px-3 py-1.5 transition-all">
                    <svg className="w-4 h-4 text-white mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search..."
                        className="outline-none text-sm bg-transparent text-white placeholder-white placeholder-opacity-70 w-full"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                onSearch('');
                            }}
                            className="ml-2 flex-shrink-0"
                        >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Filter */}
            <div className="relative flex-shrink-0">
                <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1.5 rounded transition-all whitespace-nowrap"
                    title="Filter"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Filter</span>
                    {hasActiveFilters && (
                        <span className="ml-1 bg-white text-blue-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
                            {selectedLabels.length + selectedMembers.length + (dueDateFilter ? 1 : 0)}
                        </span>
                    )}
                </button>

                {filterOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[998]"
                            onClick={() => setFilterOpen(false)}
                        />

                        {/* Filter Dropdown */}
                        <div className="absolute right-0 top-12 bg-white rounded-lg shadow-modal p-4 z-[999] w-72 max-h-96 overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Labels Filter */}
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Labels</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {availableLabels.length > 0 ? (
                                        availableLabels.map((label) => (
                                            <button
                                                key={label.id}
                                                onClick={() => handleLabelToggle(label.id)}
                                                className={`w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between transition-all hover:scale-[1.02] hover:shadow-md ${selectedLabels.includes(label.id)
                                                        ? 'ring-2 ring-blue-500 shadow-md'
                                                        : 'hover:ring-1 hover:ring-gray-300'
                                                    }`}
                                                style={{ backgroundColor: label.color }}
                                            >
                                                <span className="text-white text-sm font-semibold drop-shadow-sm">{label.name}</span>
                                                {selectedLabels.includes(label.id) && (
                                                    <svg className="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                    ))
                                    ) : (
                                    <p className="text-xs text-gray-500 italic">No labels available</p>
                                    )}
                                </div>
                            </div>

                            {/* Members Filter */}
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Members</h4>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {availableMembers.length > 0 ? (
                                        availableMembers.map((member) => (
                                            <button
                                                key={member.id}
                                                onClick={() => handleMemberToggle(member.id)}
                                                className={`w - full flex items - center px - 3 py - 2 rounded hover: bg - gray - 100 ${selectedMembers.includes(member.id) ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                                                    } `}
                                            >
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2"
                                                    style={{ backgroundColor: member.avatarColor }}
                                                >
                                                    {member.initials}
                                                </div>
                                                <span className="text-sm flex-1 text-left">{member.name}</span>
                                                {selectedMembers.includes(member.id) && (
                                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">No members available</p>
                                    )}
                                </div>
                            </div>

                            {/* Due Date Filter */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Due Date</h4>
                                <select
                                    value={dueDateFilter}
                                    onChange={(e) => handleDueDateChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All cards</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="today">Due today</option>
                                    <option value="week">Due this week</option>
                                    <option value="month">Due this month</option>
                                    <option value="no-date">No due date</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchFilter;
