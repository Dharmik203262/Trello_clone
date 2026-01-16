import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.label.deleteMany();
  await prisma.member.deleteMany();
  await prisma.board.deleteMany();

  // Create members
  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: 'Sarah Johnson',
        initials: 'SJ',
        avatarColor: '#6B46C1'
      }
    }),
    prisma.member.create({
      data: {
        name: 'Mike Chen',
        initials: 'MC',
        avatarColor: '#2563EB'
      }
    }),
    prisma.member.create({
      data: {
        name: 'Emily Davis',
        initials: 'ED',
        avatarColor: '#DC2626'
      }
    }),
    prisma.member.create({
      data: {
        name: 'Alex Rodriguez',
        initials: 'AR',
        avatarColor: '#059669'
      }
    })
  ]);

  console.log('✅ Created 4 members');

  // Create a board
  const board = await prisma.board.create({
    data: {
      title: 'Product Development Roadmap',
      backgroundColor: '#0079bf'
    }
  });

  console.log('✅ Created board:', board.title);

  // Create labels for the board
  const labels = await Promise.all([
    prisma.label.create({
      data: {
        boardId: board.id,
        name: 'High Priority',
        color: '#DC2626'
      }
    }),
    prisma.label.create({
      data: {
        boardId: board.id,
        name: 'Bug',
        color: '#EA580C'
      }
    }),
    prisma.label.create({
      data: {
        boardId: board.id,
        name: 'Feature',
        color: '#2563EB'
      }
    }),
    prisma.label.create({
      data: {
        boardId: board.id,
        name: 'Design',
        color: '#9333EA'
      }
    }),
    prisma.label.create({
      data: {
        boardId: board.id,
        name: 'Documentation',
        color: '#059669'
      }
    })
  ]);

  console.log('✅ Created 5 labels');

  // Create lists
  const todoList = await prisma.list.create({
    data: {
      boardId: board.id,
      title: 'To Do',
      position: 0
    }
  });

  const inProgressList = await prisma.list.create({
    data: {
      boardId: board.id,
      title: 'In Progress',
      position: 1
    }
  });

  const reviewList = await prisma.list.create({
    data: {
      boardId: board.id,
      title: 'Code Review',
      position: 2
    }
  });

  const doneList = await prisma.list.create({
    data: {
      boardId: board.id,
      title: 'Done',
      position: 3
    }
  });

  console.log('✅ Created 4 lists');

  // Create cards in To Do list
  const card1 = await prisma.card.create({
    data: {
      listId: todoList.id,
      title: 'Design new landing page',
      description: 'Create mockups for the new marketing landing page with updated branding guidelines.',
      position: 0,
      dueDate: new Date('2026-02-01')
    }
  });

  const card2 = await prisma.card.create({
    data: {
      listId: todoList.id,
      title: 'Set up authentication flow',
      description: 'Implement OAuth 2.0 authentication with Google and GitHub providers.',
      position: 1
    }
  });

  const card3 = await prisma.card.create({
    data: {
      listId: todoList.id,
      title: 'Database optimization',
      description: 'Analyze slow queries and add appropriate indexes.',
      position: 2,
      dueDate: new Date('2026-01-25')
    }
  });

  // Create cards in In Progress list
  const card4 = await prisma.card.create({
    data: {
      listId: inProgressList.id,
      title: 'Implement drag and drop',
      description: 'Add drag and drop functionality for cards and lists using dnd-kit library.',
      position: 0
    }
  });

  const card5 = await prisma.card.create({
    data: {
      listId: inProgressList.id,
      title: 'Fix mobile responsiveness',
      description: 'Ensure the board view works properly on mobile devices.',
      position: 1,
      dueDate: new Date('2026-01-20')
    }
  });

  // Create cards in Code Review list
  const card6 = await prisma.card.create({
    data: {
      listId: reviewList.id,
      title: 'Add search functionality',
      description: 'Implement card search with filters by labels, members, and due date.',
      position: 0
    }
  });

  // Create cards in Done list
  const card7 = await prisma.card.create({
    data: {
      listId: doneList.id,
      title: 'Setup project structure',
      description: 'Initialize React app with Vite and Express backend with Prisma ORM.',
      position: 0
    }
  });

  const card8 = await prisma.card.create({
    data: {
      listId: doneList.id,
      title: 'Create API endpoints',
      description: 'Build RESTful API for boards, lists, cards, labels, and members.',
      position: 1
    }
  });

  console.log('✅ Created 8 cards');

  // Add labels to cards
  await prisma.cardLabel.createMany({
    data: [
      { cardId: card1.id, labelId: labels[3].id }, // Design
      { cardId: card2.id, labelId: labels[2].id }, // Feature
      { cardId: card2.id, labelId: labels[0].id }, // High Priority
      { cardId: card3.id, labelId: labels[0].id }, // High Priority
      { cardId: card4.id, labelId: labels[2].id }, // Feature
      { cardId: card5.id, labelId: labels[1].id }, // Bug
      { cardId: card5.id, labelId: labels[0].id }, // High Priority
      { cardId: card6.id, labelId: labels[2].id }, // Feature
      { cardId: card8.id, labelId: labels[4].id }  // Documentation
    ]
  });

  console.log('✅ Added labels to cards');

  // Assign members to cards
  await prisma.cardMember.createMany({
    data: [
      { cardId: card1.id, memberId: members[2].id }, // Emily - Design
      { cardId: card2.id, memberId: members[0].id }, // Sarah - Auth
      { cardId: card2.id, memberId: members[1].id }, // Mike - Auth
      { cardId: card3.id, memberId: members[1].id }, // Mike - DB
      { cardId: card4.id, memberId: members[3].id }, // Alex - Drag&Drop
      { cardId: card5.id, memberId: members[2].id }, // Emily - Mobile
      { cardId: card5.id, memberId: members[3].id }, // Alex - Mobile
      { cardId: card6.id, memberId: members[0].id }, // Sarah - Search
      { cardId: card7.id, memberId: members[1].id }, // Mike - Setup
      { cardId: card8.id, memberId: members[0].id }  // Sarah - API
    ]
  });

  console.log('✅ Assigned members to cards');

  // Create checklists for some cards
  const checklist1 = await prisma.checklist.create({
    data: {
      cardId: card2.id,
      title: 'Implementation Steps',
      position: 0
    }
  });

  await prisma.checklistItem.createMany({
    data: [
      { checklistId: checklist1.id, text: 'Install passport.js', completed: true, position: 0 },
      { checklistId: checklist1.id, text: 'Configure Google OAuth', completed: true, position: 1 },
      { checklistId: checklist1.id, text: 'Configure GitHub OAuth', completed: false, position: 2 },
      { checklistId: checklist1.id, text: 'Add user session management', completed: false, position: 3 },
      { checklistId: checklist1.id, text: 'Write tests', completed: false, position: 4 }
    ]
  });

  const checklist2 = await prisma.checklist.create({
    data: {
      cardId: card4.id,
      title: 'Tasks',
      position: 0
    }
  });

  await prisma.checklistItem.createMany({
    data: [
      { checklistId: checklist2.id, text: 'Install @dnd-kit packages', completed: true, position: 0 },
      { checklistId: checklist2.id, text: 'Implement list reordering', completed: true, position: 1 },
      { checklistId: checklist2.id, text: 'Implement card reordering within list', completed: false, position: 2 },
      { checklistId: checklist2.id, text: 'Implement card moving between lists', completed: false, position: 3 }
    ]
  });

  const checklist3 = await prisma.checklist.create({
    data: {
      cardId: card1.id,
      title: 'Design Checklist',
      position: 0
    }
  });

  await prisma.checklistItem.createMany({
    data: [
      { checklistId: checklist3.id, text: 'Research competitor pages', completed: true, position: 0 },
      { checklistId: checklist3.id, text: 'Create wireframes', completed: false, position: 1 },
      { checklistId: checklist3.id, text: 'Design high-fidelity mockups', completed: false, position: 2 },
      { checklistId: checklist3.id, text: 'Get stakeholder approval', completed: false, position: 3 }
    ]
  });

  console.log('✅ Created 3 checklists with 13 items');

  console.log('\n🎉 Database seeded successfully!');
  console.log('📊 Summary:');
  console.log('   - 1 Board');
  console.log('   - 4 Lists');
  console.log('   - 8 Cards');
  console.log('   - 5 Labels');
  console.log('   - 4 Members');
  console.log('   - 3 Checklists with 13 items');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
