'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AdminModal, { fieldClass } from './AdminModal';

type Question = { prompt: string; choices: string[]; correctIndex: number };
type Quiz = { id: string; title: string; questions: Question[] };

const blankQuestion = (): Question => ({ prompt: '', choices: ['', '', '', ''], correctIndex: 0 });

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([blankQuestion()]);
  const [note, setNote] = useState('');

  const load = () => {
    fetch('/api/admin/quizzes')
      .then((res) => res.json())
      .then((data) => setQuizzes(data.quizzes || []))
      .catch(() => setNote('Could not load quizzes.'));
  };

  useEffect(() => {
    load();
  }, []);

  const start = (quiz?: Quiz) => {
    setEditingId(quiz?.id);
    setTitle(quiz?.title || '');
    setQuestions(quiz?.questions?.length ? quiz.questions.map((item) => ({ ...item, choices: [...item.choices, '', '', '', ''].slice(0, 4) })) : [blankQuestion()]);
    setNote('');
    setOpen(true);
  };

  const save = async () => {
    const res = await fetch('/api/admin/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, title, questions }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNote(data.message || 'Save failed.');
      return;
    }
    setQuizzes(data.quizzes || []);
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    const res = await fetch('/api/admin/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const data = await res.json();
    setQuizzes(data.quizzes || []);
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-extrabold text-xl">Quizzes ({quizzes.length})</h2>
          <p className="text-xs text-slate-500">Add a quiz with a question, choices, and the correct answer. Edit or delete any row.</p>
        </div>
        <button type="button" onClick={() => start()} className="bg-[#FACC15] text-[#111827] text-xs font-bold px-4 py-2 rounded-full">New quiz</button>
      </div>
      {quizzes.length === 0 ? (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-2xl px-4 py-8 text-center">No quizzes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase">
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Questions</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b border-slate-50">
                  <td className="py-3 px-3 font-bold">{quiz.title}</td>
                  <td className="py-3 px-3">{quiz.questions.length}</td>
                  <td className="py-3 px-3 text-right space-x-1">
                    <button type="button" title="Edit" onClick={() => start(quiz)} className="p-1.5 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
                    <button type="button" title="Delete" onClick={() => remove(quiz.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && (
        <AdminModal title={editingId ? 'Edit quiz' : 'New quiz'} onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" />
            {questions.map((question, index) => (
              <div key={index} className="border border-slate-100 rounded-2xl p-3 space-y-2">
                <input className={fieldClass} value={question.prompt} placeholder="Question" onChange={(e) => {
                  const next = [...questions];
                  next[index] = { ...question, prompt: e.target.value };
                  setQuestions(next);
                }} />
                {question.choices.map((choice, choiceIndex) => (
                  <input key={choiceIndex} className={fieldClass} value={choice} placeholder={`Choice ${choiceIndex + 1}`} onChange={(e) => {
                    const choices = [...question.choices];
                    choices[choiceIndex] = e.target.value;
                    const next = [...questions];
                    next[index] = { ...question, choices };
                    setQuestions(next);
                  }} />
                ))}
                <label className="text-xs font-bold text-slate-500">Correct answer
                  <select className={`${fieldClass} mt-1`} value={question.correctIndex} onChange={(e) => {
                    const next = [...questions];
                    next[index] = { ...question, correctIndex: Number(e.target.value) };
                    setQuestions(next);
                  }}>
                    {question.choices.map((choice, choiceIndex) => (
                      <option key={choiceIndex} value={choiceIndex}>{choice || `Choice ${choiceIndex + 1}`}</option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
            <button type="button" className="text-xs font-bold" onClick={() => setQuestions([...questions, blankQuestion()])}>Add another question</button>
            {note && <p className="text-sm text-rose-600">{note}</p>}
            <button type="button" onClick={save} className="bg-[#111827] text-white text-sm font-bold px-4 py-2 rounded-xl">Save quiz</button>
          </div>
        </AdminModal>
      )}
    </section>
  );
}
