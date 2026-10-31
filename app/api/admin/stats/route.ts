import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth-server';
import { isFirebaseDemo } from '@/lib/utils';
import { listProfiles } from '@/lib/accounts';
import { listPayments } from '@/lib/payments';

export async function GET() {
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin_session');

  // Cryptographically validate admin authentication cookie token
  const session = verifyAdminSession(adminSession?.value);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    let courses: any[] = [];
    let realTransactions: any[] = [];
    let realStudents: any[] = [];
    let dataAvailable = false;
    try {
      realStudents = (await listProfiles()).filter((profile) => profile.roles.includes('Student') && !profile.disabled);
      dataAvailable = true;
    } catch {
      // Keep unavailable analytics empty instead of inventing counts.
    }
    if (!isFirebaseDemo()) try {
      const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const [courseSnap, txnSnap] = await Promise.all([
        getDocs(collection(db, 'courses')),
        getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(200))),
      ]);
      courses = courseSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      dataAvailable = true;
      txnSnap.forEach((doc) => {
        realTransactions.push({ id: doc.id, ...doc.data() });
      });
    } catch {
      dataAvailable = false;
    }

    const manualPayments = await listPayments();
    const paidTransactions = [
      ...realTransactions.filter((txn) => ['paid', 'success', 'valid', 'completed'].includes(String(txn.status || '').toLowerCase())),
      ...manualPayments.filter((payment) => ['paid', 'approved'].includes(payment.status)).map((payment) => ({
        ...payment, studentId: payment.studentEmail || payment.studentName,
        createdAt: payment.createdAt, courseTitle: payment.courseTitle,
      })),
    ];
    const totalStudents = new Set(paidTransactions.map((txn) => String(txn.studentId || txn.studentEmail || txn.studentName || '')).filter(Boolean)).size;
    const calculatedCourseRevenue = paidTransactions.reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0);
    const courseAnalytics = new Map<string, { learners: Set<string>; revenue: number; transactions: number }>();
    for (const txn of paidTransactions) {
      const key = String(txn.courseId || txn.courseTitle || '');
      if (!key) continue;
      const record = courseAnalytics.get(key) || { learners: new Set<string>(), revenue: 0, transactions: 0 };
      const learner = String(txn.studentId || txn.studentEmail || txn.studentName || '');
      if (learner) record.learners.add(learner);
      record.revenue += Number(txn.amount) || 0;
      record.transactions += 1;
      courseAnalytics.set(key, record);
    }
    const monthlyMap = new Map<string, { month: string; revenue: number; sales: number; signups: number }>();
    for (const txn of paidTransactions) {
      const date = txn.createdAt?.toDate ? txn.createdAt.toDate() : new Date(txn.createdAt || txn.date || '');
      if (Number.isNaN(date.getTime())) continue;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) || { month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), revenue: 0, sales: 0, signups: 0 };
      entry.revenue += Number(txn.amount) || 0; entry.sales += 1; monthlyMap.set(key, entry);
    }
    for (const student of realStudents) {
      const date = student.createdAt?.toDate ? student.createdAt.toDate() : new Date(student.createdAt || student.created_at || student.joinedDate || '');
      if (Number.isNaN(date.getTime())) continue;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) || { month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), revenue: 0, sales: 0, signups: 0 };
      entry.signups += 1; monthlyMap.set(key, entry);
    }

    // Category inventory shows real course documents only.
    const categoryDistributionMap: Record<string, { count: number; students: number; revenue: number }> = {};
    courses.forEach((c) => {
      const cat = c.category || 'Accounting';
      if (!categoryDistributionMap[cat]) {
        categoryDistributionMap[cat] = { count: 0, students: 0, revenue: 0 };
      }
      categoryDistributionMap[cat].count += 1;
        const analytics = courseAnalytics.get(String(c.id)) || courseAnalytics.get(String(c.title));
        categoryDistributionMap[cat].students += analytics?.learners.size || 0;
        categoryDistributionMap[cat].revenue += analytics?.revenue || 0;
    });

    const categoryDistribution = Object.entries(categoryDistributionMap).map(([name, data]) => ({
      name,
      courses: data.count,
      students: data.students,
      revenue: data.revenue,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalRevenue: calculatedCourseRevenue,
        completionRate: 0,
        totalCourses: courses.length,
        dataAvailable,
        courses: courses.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category || 'Accounting',
          price: c.price,
          duration: c.duration || '',
          lessonCount: c.lessonCount || 0,
          studentCount: 0,
          thumbnail: c.thumbnail,
          rating: c.rating || 0,
        })),
        topCourses: [],
        categoryDistribution,
        transactions: realTransactions,
        studentsList: realStudents.map((student) => ({ id: student.id, name: student.name, email: student.email, created_at: student.created_at })),
        monthlyRevenue: [...monthlyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([, value]) => value),
      },
    });
  } catch (error: any) {
    console.error('[Admin Stats API Error]:', error);
    return NextResponse.json({ success: false, message: 'Database query error' }, { status: 500 });
  }
}
