import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { deleteStudent, listStudents, saveStudent, type StudentStatus } from '@/lib/admin-studio';

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;
  return NextResponse.json({ success: true, students: listStudents() });
}

export async function POST(request: Request) {
  const denied = requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (body.action === 'delete') {
      deleteStudent(String(body.id || ''));
      return NextResponse.json({ success: true, students: listStudents() });
    }
    const student = saveStudent({
      id: body.id ? String(body.id) : undefined,
      name: String(body.name || ''),
      email: String(body.email || ''),
      program: String(body.program || ''),
      status: String(body.status || 'Active') as StudentStatus,
    });
    return NextResponse.json({ success: true, student, students: listStudents() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save the student.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
