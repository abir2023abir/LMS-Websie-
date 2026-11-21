import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth-server';
import { currentProfile } from '@/lib/user-session';
import { requireAdmin } from '@/lib/admin-guard';
import { getAllCourses } from '@/lib/db';
import { listProfiles } from '@/lib/accounts';
import { listPayments } from '@/lib/payments';
import { listServiceRequests } from '@/lib/service-requests';
import { listCertificateRecords } from '@/lib/certificate-db';

export async function GET() {
  const denied = await requireAdmin('Overview');
  if (denied) return denied;

  try {
    let courses: any[] = [];
    let realStudents: any[] = [];
    let dataAvailable = false;
    try {
      realStudents = (await listProfiles()).filter((profile) => profile.roles.includes('Student') && !profile.disabled);
      dataAvailable = true;
    } catch {
      // Keep unavailable analytics empty instead of inventing counts.
    }
    try {
      courses = await getAllCourses();
    } catch {
      dataAvailable = false;
    }

    const [manualPayments, serviceRequests, certificates] = await Promise.all([
      listPayments(),
      listServiceRequests().catch(() => []),
      listCertificateRecords().catch(() => []),
    ]);
    // A service counts as enrolled once the team has taken it on (in progress or done).
    const enrolledServices = serviceRequests.filter((item) => item.status === 'progress' || item.status === 'done');
    const serviceRevenue = enrolledServices.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const paidTransactions = [
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
    const monthlyMap = new Map<string, { month: string; revenue: number; sales: number; services: number; signups: number }>();
    const monthEntry = (date: Date) => {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) || { month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), revenue: 0, sales: 0, services: 0, signups: 0 };
      monthlyMap.set(key, entry);
      return entry;
    };
    for (const txn of paidTransactions) {
      const date = new Date(txn.createdAt || '');
      if (Number.isNaN(date.getTime())) continue;
      const entry = monthEntry(date);
      entry.revenue += Number(txn.amount) || 0; entry.sales += 1;
    }
    for (const student of realStudents) {
      const date = student.createdAt?.toDate ? student.createdAt.toDate() : new Date(student.createdAt || student.created_at || student.joinedDate || '');
      if (Number.isNaN(date.getTime())) continue;
      monthEntry(date).signups += 1;
    }
    for (const item of enrolledServices) {
      const date = new Date(item.createdAt || '');
      if (Number.isNaN(date.getTime())) continue;
      monthEntry(date).services += Number(item.price) || 0;
    }

    // Course completion: valid certificates issued against paid enrollments.
    const validCertificates = certificates.filter((cert) => cert.status !== 'REVOKED').length;
    const completionRate = paidTransactions.length ? Math.min(100, Math.round((validCertificates / paidTransactions.length) * 100)) : 0;

    // Top performing courses: most learners first, then revenue.
    const topCourses = [...courseAnalytics.entries()]
      .map(([key, record]) => {
        const course = courses.find((c) => String(c.id) === key || String(c.title) === key);
        return course ? { id: String(course.id), title: course.title, category: course.category || 'Accounting', sales: record.learners.size, revenue: record.revenue, rating: course.rating || 0, price: course.price, thumbnail: course.thumbnail || '' } : null;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => b.sales - a.sales || b.revenue - a.revenue)
      .slice(0, 5);

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

    // Name for the Overview greeting: the admin's sign-in name, or the instructor's account name.
    const admin = verifyAdminSession(cookies().get('admin_session')?.value);
    const viewerName = admin ? admin.username : (await currentProfile())?.name || '';

    return NextResponse.json({
      success: true,
      viewerName,
      stats: {
        totalStudents,
        totalRevenue: calculatedCourseRevenue,
        completionRate,
        serviceRevenue,
        enrolledServices: enrolledServices.length,
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
        topCourses,
        categoryDistribution,
        studentsList: realStudents.map((student) => ({ id: student.id, name: student.name, email: student.email, created_at: student.created_at })),
        monthlyRevenue: [...monthlyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([, value]) => value),
      },
    });
  } catch (error: any) {
    console.error('[Admin Stats API Error]:', error);
    return NextResponse.json({ success: false, message: 'Database query error' }, { status: 500 });
  }
}
