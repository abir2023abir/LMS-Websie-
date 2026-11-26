import { createCourse, deleteCourse, getAllCourses } from '@/lib/db';
import { deleteQuiz, listQuizzes, saveQuiz } from '@/lib/quizzes';
import { deleteAssignment, listAssignments, saveAssignment } from '@/lib/assignments';
import { deleteExam, listExams, saveExam } from '@/lib/exams';
import { deleteLiveClass, listLiveClasses, saveLiveClass } from '@/lib/live-classes';
import {
  addDiscussionNote, courseQuestions, deleteCourseQuestion, deleteDiscussionNote, deleteShortVideo,
  discussionPosts, saveCourseQuestion, saveShortVideo, shortVideos,
} from '@/lib/course-community';
import { deleteReview, listReviews, saveReview } from '@/lib/reviews';
import { saveDayPlan } from '@/lib/course-timeline';
import type { CourseSchema, CourseType } from '@/types/course';

/*
 * Demo courses for showing the client how a full course looks and works. Every part a course can
 * have is filled. The admin adds and removes them from the Courses tool; titles, reviews and
 * discussion names all say "Demo" so nobody takes them for real programmes or real learners.
 */

type Question = [prompt: string, choices: string[], correct: number, explanation: string];
type DemoLesson = {
  title: string;
  video: [url: string, duration: string];
  more?: [title: string, url: string];
  overview: string;
  notes: string;
  actions: string[];
  questions: Question[];
  assignment: [title: string, instructions: string];
};
type DemoCourse = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: CourseType;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  duration: string;
  outcomes: string[];
  prerequisites: string[];
  audience: string[];
  certification: string;
  modules: [title: string, lessons: DemoLesson[]][];
  shorts: [title: string, description: string, url: string][];
  faq: [question: string, answer: string][];
  discussion: [question: string, reply: string][];
  reviews: [title: string, text: string, rating: number][];
};

const youtube = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const picture = (id: string) => `https://images.unsplash.com/${id}?w=900&h=520&fit=crop&auto=format`;

const VIDEO = {
  basics: youtube('YDCh39Wdnfk'),
  twoMinutes: youtube('mJfalbgYwzI'),
  debits: youtube('kNgysye8OeE'),
  debitsRight: youtube('I_P8lYxOonE'),
  debitsClear: youtube('92cBEoT8EVU'),
  accrual: youtube('HqmmR4EMlP4'),
  excelIntro: youtube('rJbf-2XXsuY'),
  excelFive: youtube('QEl8XdccHeU'),
};

const DEMO_COURSES: DemoCourse[] = [
  {
    id: 'democoursebookkeeping01',
    title: 'DEMO: Bookkeeping Step by Step',
    description: 'A sample recorded course that shows every part of a lesson: videos, notes, quiz, assignment, live class and exams. Demo content for preview only.',
    category: 'Accounting',
    type: 'Recorded',
    price: 0,
    thumbnail: picture('photo-1554224155-6726b3ff858f'),
    duration: '4h 00m',
    outcomes: ['Record daily business transactions', 'Tell debits from credits with confidence', 'Read a simple profit and loss statement', 'Keep records ready for month end'],
    prerequisites: ['No earlier accounting study is needed', 'A phone or computer with internet'],
    audience: ['New learners who want office-ready bookkeeping skills', 'Small business owners who keep their own records'],
    certification: 'Finish every lesson and pass the final exam to receive a demo certificate that can be checked on the Verify a Certificate page.',
    modules: [
      ['Module 1: Foundations', [
        {
          title: 'What bookkeeping does',
          video: [VIDEO.basics, '1:00'],
          overview: 'This lesson explains why every business records its money, and what a bookkeeper does each day.',
          notes: 'Bookkeeping is the daily recording of money coming in and going out.\n\nKeep a receipt or invoice for every entry.\nExtra reading: https://en.wikipedia.org/wiki/Bookkeeping',
          actions: ['Write down five things you spent money on today', 'Mark each one as business or personal'],
          questions: [
            ['What is the main job of bookkeeping?', ['Recording business transactions', 'Designing products', 'Hiring staff'], 0, 'Bookkeeping records the money that moves in and out.'],
            ['Which paper supports a purchase entry?', ['A receipt or invoice', 'A birthday card', 'A map'], 0, 'Every entry needs proof.'],
            ['How often should records be updated?', ['Regularly, ideally daily', 'Once in ten years', 'Never'], 0, 'Small daily entries prevent mistakes.'],
          ],
          assignment: ['List one day of transactions', 'Write five transactions from one day. For each, give the date, a short description and the amount.'],
        },
        {
          title: 'Debits and credits',
          video: [VIDEO.twoMinutes, '4:40'],
          more: ['More practice with debits and credits', VIDEO.debitsClear],
          overview: 'Every transaction touches two accounts. This lesson shows which side goes up.',
          notes: 'Debits increase assets and expenses.\nCredits increase liabilities, equity and income.\nThe two sides of an entry are always equal.',
          actions: ['Pick three transactions and write the debit and credit for each'],
          questions: [
            ['Cash received from a customer is recorded in Cash as a…', ['Debit', 'Credit', 'Neither'], 0, 'Cash is an asset, so it rises with a debit.'],
            ['A new bank loan increases a liability with a…', ['Credit', 'Debit', 'Discount'], 0, 'Liabilities rise with a credit.'],
            ['In every entry, total debits must…', ['Equal total credits', 'Be larger than credits', 'Be zero'], 0, 'Double entry keeps both sides equal.'],
          ],
          assignment: ['Write three journal entries', 'Record: owner invests cash, buys supplies, and receives a payment. Show debit and credit for each.'],
        },
      ]],
      ['Module 2: Month end', [
        {
          title: 'Cash and accrual accounting',
          video: [VIDEO.accrual, '5:32'],
          overview: 'Should income be recorded when money arrives, or when it is earned? Compare the two methods.',
          notes: 'Cash basis records money when it moves.\nAccrual basis records income when earned and costs when incurred.',
          actions: ['Decide which method suits a small shop and write one reason'],
          questions: [
            ['Accrual accounting records income when it is…', ['Earned', 'Spent', 'Forgotten'], 0, 'Timing follows the work, not the cash.'],
            ['Cash basis records a sale when…', ['Money is received', 'The goods are designed', 'The year ends'], 0, 'Cash basis follows the money.'],
            ['An unpaid customer invoice is called…', ['A receivable', 'A salary', 'A tax holiday'], 0, 'It is money still to be received.'],
          ],
          assignment: ['Compare the two methods', 'In 80–120 words, explain how one credit sale looks under each method.'],
        },
        {
          title: 'Closing the month',
          video: [VIDEO.debitsRight, '4:16'],
          overview: 'Check balances, match the bank statement and prepare a simple report.',
          notes: 'Month-end checklist:\n1. Enter all receipts\n2. Match the bank statement\n3. Review unpaid invoices\n4. Prepare the profit and loss statement',
          actions: ['Copy the checklist and tick what you can already do'],
          questions: [
            ['Bank reconciliation compares records with the…', ['Bank statement', 'Weather report', 'Class routine'], 0, 'Both should agree.'],
            ['Profit equals income minus…', ['Expenses', 'Assets', 'Cash'], 0, 'Profit is what remains after costs.'],
            ['Unpaid invoices should be…', ['Reviewed at month end', 'Deleted', 'Ignored'], 0, 'Follow up on money owed.'],
          ],
          assignment: ['Prepare a mini report', 'Using income of 50,000 and expenses of 32,000, show the profit and write two observations.'],
        },
      ]],
    ],
    shorts: [
      ['Debits in one minute', 'A quick reminder before the quiz.', VIDEO.basics],
      ['Debit or credit?', 'Short revision for Module 1.', VIDEO.debits],
    ],
    faq: [
      ['Do I need to be good at maths?', 'No. Adding and subtracting is enough for this course.'],
      ['Can I study on my phone?', 'Yes. Videos, quizzes and assignments all work on a phone.'],
      ['When do I get the certificate?', 'After every lesson is finished and the final exam is passed.'],
    ],
    discussion: [
      ['Is a receipt needed for very small expenses?', 'Yes, keep it whenever you can. If there is none, write a short voucher.'],
      ['How long should I keep records?', 'Keep them at least as long as your tax rules ask.'],
    ],
    reviews: [
      ['Clear first lesson', 'Short videos and a quiz right after helped me remember the idea.', 5],
      ['Good practice tasks', 'The assignments feel like real office work.', 4],
    ],
  },
  {
    id: 'democoursefinancelive02',
    title: 'DEMO: Business Finance Live Class',
    description: 'A sample live course with scheduled classes, class recordings, quizzes, assignments and exams. Demo content for preview only.',
    category: 'Business',
    type: 'Live',
    price: 0,
    thumbnail: picture('photo-1460925895917-afdab827c52f'),
    duration: '3h 00m',
    outcomes: ['Understand income, cost and profit', 'Build a simple cash plan', 'Ask better questions about a business report'],
    prerequisites: ['Comfort with basic numbers'],
    audience: ['Founders and shop owners', 'Students preparing for office jobs'],
    certification: 'Attend the lessons and pass the final exam to receive a demo certificate.',
    modules: [
      ['Module 1: Money basics', [
        {
          title: 'Income, cost and profit',
          video: [VIDEO.basics, '1:00'],
          overview: 'Learn the three numbers every owner should check first.',
          notes: 'Income − Cost = Profit.\nSeparate fixed costs (rent) from changing costs (materials).',
          actions: ['Write your three biggest monthly costs'],
          questions: [
            ['Rent is usually a…', ['Fixed cost', 'Changing cost', 'Income'], 0, 'Rent stays the same each month.'],
            ['Income of 100 and cost of 70 gives profit of…', ['30', '170', '70'], 0, '100 − 70 = 30.'],
            ['Materials used per product are a…', ['Changing cost', 'Fixed cost', 'Loan'], 0, 'They rise with each product.'],
          ],
          assignment: ['Your profit sheet', 'Choose a small business. List its income and costs for one month and calculate the profit.'],
        },
        {
          title: 'Reading a report',
          video: [VIDEO.accrual, '5:32'],
          overview: 'Find the story inside a profit and loss statement.',
          notes: 'Read from the top: sales, cost of sales, gross profit, other expenses, net profit.',
          actions: ['Circle the largest expense on a sample report'],
          questions: [
            ['Gross profit is sales minus…', ['Cost of sales', 'Cash', 'Equity'], 0, 'It shows profit before other expenses.'],
            ['Net profit comes…', ['After all expenses', 'Before sales', 'Only in January'], 0, 'It is the bottom line.'],
            ['A report helps an owner…', ['Make decisions', 'Skip planning', 'Hide costs'], 0, 'Numbers guide choices.'],
          ],
          assignment: ['Explain one report', 'In your own words, say what changed between two months of a sample report.'],
        },
      ]],
      ['Module 2: Planning', [
        {
          title: 'Cash planning',
          video: [VIDEO.debitsClear, '5:02'],
          overview: 'A profitable business can still run out of cash. Plan ahead.',
          notes: 'List expected money in and out week by week.\nKeep a small reserve for surprises.',
          actions: ['Draft next month’s cash plan'],
          questions: [
            ['A cash plan shows…', ['Money in and out over time', 'Only profit', 'Staff names'], 0, 'Timing matters.'],
            ['A reserve is useful for…', ['Unexpected costs', 'Decoration only', 'Nothing'], 0, 'It protects the business.'],
            ['Late customer payments affect…', ['Cash', 'The logo', 'The address'], 0, 'Cash arrives later than planned.'],
          ],
          assignment: ['Four-week cash plan', 'Make a four-week table with money in, money out and the closing balance.'],
        },
        {
          title: 'Deciding with numbers',
          video: [VIDEO.debitsRight, '4:16'],
          overview: 'Compare two choices using cost and expected income.',
          notes: 'Write both options, their cost and what each could earn. Then choose and give the reason.',
          actions: ['Compare two suppliers'],
          questions: [
            ['Before choosing an option, compare…', ['Cost and benefit', 'Colour only', 'Font size'], 0, 'Both sides matter.'],
            ['A higher price can still be better if…', ['It brings more value', 'It is newer on paper', 'Never'], 0, 'Value counts, not price alone.'],
            ['Good decisions are…', ['Written down with reasons', 'Random', 'Kept secret from the team'], 0, 'Reasons can be reviewed later.'],
          ],
          assignment: ['One-page decision', 'Describe a purchase decision with two options and your recommendation.'],
        },
      ]],
    ],
    shorts: [
      ['Profit in one minute', 'Quick revision of lesson 1.', VIDEO.basics],
      ['Accrual idea', 'Why timing changes a report.', VIDEO.accrual],
    ],
    faq: [
      ['What if I miss a live class?', 'The recording is added to the lesson after the class.'],
      ['How do I join a live class?', 'Open the lesson and press Join. The button works 15 minutes before the start time.'],
    ],
    discussion: [
      ['Will the next live class include examples from a shop?', 'Yes, we will work through a small shop example together.'],
    ],
    reviews: [
      ['Live class felt easy to follow', 'I liked asking questions and watching the recording again.', 5],
      ['Useful for my shop', 'The cash plan task was the most helpful part.', 5],
    ],
  },
  {
    id: 'democourseexceloffice03',
    title: 'DEMO: Excel for Office Work (paid sample)',
    description: 'Demo only — please do not send any payment. A sample priced course that shows how price, discount and enrollment look, with the full set of lesson parts.',
    category: 'Digital Skills',
    type: 'Workshop',
    price: 10,
    originalPrice: 20,
    thumbnail: picture('photo-1516321318423-f06f85e504b3'),
    duration: '2h 30m',
    outcomes: ['Create a clean spreadsheet', 'Use basic formulas', 'Sort, filter and present data'],
    prerequisites: ['A computer with Excel or a similar spreadsheet app'],
    audience: ['Job seekers', 'Office assistants'],
    certification: 'Pass the final exam to receive a demo certificate.',
    modules: [
      ['Module 1: Getting started', [
        {
          title: 'Your first spreadsheet',
          video: [VIDEO.excelIntro, '4:59'],
          overview: 'Meet rows, columns and cells, then enter your first table.',
          notes: 'A cell is named by its column and row, for example B3.\nSave your file often.',
          actions: ['Make a table of five items with prices'],
          questions: [
            ['The cell in column B, row 3 is…', ['B3', '3B', 'BB'], 0, 'Column letter first, then row number.'],
            ['Rows run…', ['Across', 'Down', 'Diagonally'], 0, 'Rows are horizontal.'],
            ['To keep your work you should…', ['Save the file', 'Close without saving', 'Delete it'], 0, 'Saving keeps changes.'],
          ],
          assignment: ['Price list', 'Create a price list of eight items and upload the file or paste the table.'],
        },
        {
          title: 'Basic formulas',
          video: [VIDEO.excelFive, '5:01'],
          overview: 'Add, average and count with simple formulas.',
          notes: '=SUM(B2:B9) adds.\n=AVERAGE(B2:B9) finds the average.\n=COUNT(B2:B9) counts numbers.',
          actions: ['Add a total row to your price list'],
          questions: [
            ['Which formula adds numbers?', ['SUM', 'COUNT', 'LEFT'], 0, 'SUM adds a range.'],
            ['A formula starts with…', ['=', '#', '@'], 0, 'The equals sign begins a formula.'],
            ['B2:B9 means…', ['A range of cells', 'One cell', 'A file name'], 0, 'The colon marks a range.'],
          ],
          assignment: ['Totals and average', 'Add SUM and AVERAGE to your table and describe the result.'],
        },
      ]],
      ['Module 2: Working with data', [
        {
          title: 'Sort and filter',
          video: [VIDEO.excelIntro, '4:59'],
          overview: 'Find what you need in a long list.',
          notes: 'Select the headings, then switch on Filter. Sort from the same menu.',
          actions: ['Sort your list from highest to lowest price'],
          questions: [
            ['Filter is used to…', ['Show only matching rows', 'Print money', 'Rename the app'], 0, 'It hides rows that do not match.'],
            ['Sorting changes the…', ['Order of rows', 'Screen colour', 'Keyboard'], 0, 'Rows are re-ordered.'],
            ['Headings help to…', ['Name each column', 'Delete data', 'Lock the computer'], 0, 'Headings describe the data.'],
          ],
          assignment: ['Filtered view', 'Filter your list to one category and describe what you see.'],
        },
        {
          title: 'Present your work',
          video: [VIDEO.excelFive, '5:01'],
          overview: 'Make a table easy to read and add a simple chart.',
          notes: 'Use bold headings, one currency format and a chart with a clear title.',
          actions: ['Insert one chart from your table'],
          questions: [
            ['A chart should have…', ['A clear title', 'No labels', 'Hidden data'], 0, 'Titles tell readers what they see.'],
            ['Bold headings make a table…', ['Easier to read', 'Slower', 'Empty'], 0, 'They stand out.'],
            ['Money columns should use…', ['One consistent format', 'Random formats', 'Only text'], 0, 'Consistency avoids mistakes.'],
          ],
          assignment: ['Final sheet', 'Share your finished table with one chart and two sentences about it.'],
        },
      ]],
    ],
    shorts: [
      ['SUM in a minute', 'Revision before the quiz.', VIDEO.excelFive],
      ['Spreadsheet tour', 'Where everything lives.', VIDEO.excelIntro],
    ],
    faq: [
      ['Can I use Google Sheets?', 'Yes. The formulas in this demo work there too.'],
      ['Is this a real paid course?', 'No. It is a demo that shows how a priced course looks.'],
    ],
    discussion: [
      ['My total shows an error. Why?', 'Check that every cell in the range contains a number.'],
    ],
    reviews: [
      ['Simple and practical', 'I made my first chart during the lesson.', 4],
    ],
  },
];

export const DEMO_COURSE_IDS = DEMO_COURSES.map((course) => course.id);

const DAY = 86400000;
const LESSON_DAYS = 7;
const ACCESS_DAYS = 30;
const lines = (list: string[]) => list.join('\n');
// The lists above put the right answer first; rotating the choices moves it around on screen.
const questionsOf = (list: Question[]) => list.map(([prompt, choices, correct, explanation], index) => {
  const shift = (index + prompt.length) % choices.length;
  return {
    id: '', prompt, explanation,
    choices: [...choices.slice(shift), ...choices.slice(0, shift)],
    correctIndex: (correct - shift + choices.length) % choices.length,
  };
});
const examQuestions = (list: Question[]) => questionsOf(list).map((question) => ({ ...question, points: 5 }));

export async function installedDemoCourses() {
  const present = new Set((await getAllCourses()).map((course) => String(course.id)));
  return DEMO_COURSE_IDS.filter((id) => present.has(id)).length;
}

/** Takes the demo courses and everything attached to them away. Real courses are never touched. */
export async function removeDemoCourses() {
  const demo = new Set(DEMO_COURSE_IDS);
  for (const item of await listQuizzes()) if (demo.has(item.courseId)) await deleteQuiz(item.id);
  for (const item of await listAssignments()) if (demo.has(item.courseId)) await deleteAssignment(item.id);
  for (const item of await listExams()) if (demo.has(item.courseId)) await deleteExam(item.id);
  for (const item of await listLiveClasses()) if (demo.has(item.courseId)) await deleteLiveClass(item.id);
  for (const item of await listReviews()) if (item.courseId && demo.has(item.courseId)) await deleteReview(item.id);
  for (const courseId of DEMO_COURSE_IDS) {
    for (const item of await shortVideos(courseId)) await deleteShortVideo(courseId, item.id);
    for (const item of await courseQuestions(courseId)) await deleteCourseQuestion(courseId, item.id);
    for (const item of await discussionPosts(courseId)) await deleteDiscussionNote(courseId, item.id);
    await saveDayPlan(courseId, 0);
    await deleteCourse(courseId);
  }
}

async function addCourse(demo: DemoCourse, now: number) {
  const modules = demo.modules.map(([title, lessons], m) => ({
    id: `${demo.id}-m${m + 1}`,
    title,
    lessons: lessons.map((lesson, l) => {
      const id = `${demo.id}-m${m + 1}l${l + 1}`;
      return {
        id,
        title: lesson.title,
        videoUrl: lesson.video[0],
        duration: lesson.video[1],
        days: LESSON_DAYS,
        overview: lesson.overview,
        notes: lesson.notes,
        actionSteps: lines(lesson.actions),
        ...(lesson.more ? { moreVideos: [{ id: `${id}-v2`, title: lesson.more[0], url: lesson.more[1] }] } : {}),
      };
    }),
  }));

  const course: Omit<CourseSchema, 'id' | 'createdAt' | 'updatedAt'> = {
    title: demo.title,
    description: demo.description,
    instructorId: 'demo-mentor',
    instructorName: 'Demo Mentor',
    price: demo.price,
    ...(demo.originalPrice ? { originalPrice: demo.originalPrice } : {}),
    thumbnail: demo.thumbnail,
    category: demo.category,
    type: demo.type,
    duration: demo.duration,
    outcomes: lines(demo.outcomes),
    prerequisites: lines(demo.prerequisites),
    audience: lines(demo.audience),
    certification: demo.certification,
    lessonCount: modules.reduce((sum, module) => sum + module.lessons.length, 0),
    modules,
  };
  await createCourse(course, demo.id);
  await saveDayPlan(demo.id, ACCESS_DAYS);

  const base = { courseId: demo.id, courseTitle: demo.title };
  const flat = demo.modules.flatMap(([, lessons], m) => lessons.map((lesson, l) => ({
    lesson,
    place: { moduleId: modules[m].id, moduleTitle: modules[m].title, lessonId: modules[m].lessons[l].id, lessonTitle: lesson.title },
  })));
  const dueDate = new Date(now + 14 * DAY).toISOString().slice(0, 10);

  for (const [index, { lesson, place }] of flat.entries()) {
    await saveQuiz({
      ...base, ...place,
      title: `Quiz: ${lesson.title}`,
      passMark: 60, maxAttempts: 0, published: true, showAnswers: true, marksPerQuestion: 1,
      // The second quiz of each course shows the timer and negative marking.
      ...(index === 1 ? { timeLimitMinutes: 5, negativeMarks: 0.25 } : {}),
      questions: questionsOf(lesson.questions),
    });
    await saveAssignment({
      ...base, ...place,
      title: lesson.assignment[0], instructions: lesson.assignment[1],
      dueDate, maxScore: 20, allowFile: true, published: true,
    });
  }

  for (const [m, [, lessons]] of demo.modules.entries()) {
    // A module exam belongs to its last lesson.
    if (m > 0) continue;
    await saveExam({
      ...base, moduleId: modules[m].id, moduleTitle: modules[m].title, lessonId: '', lessonTitle: '',
      title: `Module ${m + 1} exam`, description: 'A short timed exam on this module.',
      durationMinutes: 10, passMark: 50, maxAttempts: 0, shuffle: true, showAnswers: true, published: true,
      questions: examQuestions(lessons.flatMap((lesson) => lesson.questions.slice(0, 2))),
    });
  }
  await saveExam({
    ...base, moduleId: '', moduleTitle: '', lessonId: '', lessonTitle: '',
    title: 'Course final exam', description: 'Opens after every lesson is finished.',
    durationMinutes: 20, passMark: 50, maxAttempts: 0, shuffle: true, showAnswers: true, published: true,
    questions: examQuestions(flat.map(({ lesson }) => lesson.questions[2])),
  });

  // One class coming up, one already held with its recording, and one next week.
  const classes: [lessonIndex: number, days: number, title: string, recording: string][] = [
    [0, 2, 'Demo live class: questions and practice', ''],
    [1, -3, 'Demo class recording: worked examples', flat[1].lesson.video[0]],
    [2, 6, 'Demo live class: month-end clinic', ''],
  ];
  for (const [lessonIndex, days, title, recording] of classes) {
    await saveLiveClass({
      ...base, ...flat[lessonIndex].place,
      title, description: 'Sample schedule for the demo. The meeting link is a placeholder.',
      startsAt: new Date(now + days * DAY).toISOString(), durationMinutes: 60,
      joinUrl: 'https://meet.google.com/', recordingUrl: recording, published: true,
    });
  }

  for (const [index, [title, description, url]] of demo.shorts.entries()) {
    await saveShortVideo(demo.id, { ...flat[index * 2].place, title, description, url });
  }
  for (const [question, answer] of demo.faq) await saveCourseQuestion(demo.id, { question, answer });

  for (const [question, reply] of demo.discussion) {
    await addDiscussionNote(demo.id, { name: 'Demo Learner', role: 'Student' }, question);
    const [post] = await discussionPosts(demo.id);
    await addDiscussionNote(demo.id, { name: 'Demo Mentor', role: 'Mentor' }, reply, post.id);
  }

  for (const [index, [title, text, rating]] of demo.reviews.entries()) {
    await saveReview({
      name: `Demo Learner ${index + 1}`, role: 'Sample review', title, text: `[Demo review] ${text}`, rating,
      verified: true, permission: true, published: true, pages: ['course'], courseId: demo.id, courseTitle: demo.title,
    });
  }
}

/** Adds the demo courses afresh: running it again resets their dates and content. */
export async function installDemoCourses(now = Date.now()) {
  await removeDemoCourses();
  // Added last-first, so the first course appears at the top of the lists.
  for (const course of [...DEMO_COURSES].reverse()) await addCourse(course, now);
  return DEMO_COURSE_IDS.length;
}
