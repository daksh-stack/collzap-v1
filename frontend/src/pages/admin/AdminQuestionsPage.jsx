import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';
import toast from 'react-hot-toast';

export default function AdminQuestionsPage() {
  const { questions, interests, fetchInterests, fetchQuestions, createQuestion, updateQuestion, deleteQuestion, loading } = useAdminStore();
  
  const [activeInterest, setActiveInterest] = useState('ALL');
  const [page, setPage] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    interestId: '',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0
  });

  useEffect(() => {
    fetchInterests();
  }, []);

  useEffect(() => {
    const interestId = activeInterest === 'ALL' ? null : activeInterest;
    fetchQuestions(interestId, page).catch(console.error);
  }, [activeInterest, page]);

  const handleOpenModal = (q = null) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        interestId: q.interestId,
        questionText: q.questionText,
        options: [...q.options],
        correctOptionIndex: q.correctOptionIndex
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        interestId: activeInterest === 'ALL' ? (interests[0]?.id || '') : activeInterest,
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.questionText.trim()) return toast.error('Question text required');
    if (!formData.interestId) return toast.error('Interest required');
    if (formData.options.some(opt => !opt.trim())) return toast.error('All 4 options required');

    try {
      if (editingQuestion) {
        await updateQuestion(
          editingQuestion.id,
          formData.questionText,
          formData.options,
          formData.correctOptionIndex,
          formData.interestId
        );
        toast.success('Question updated');
      } else {
        await createQuestion(
          formData.questionText,
          formData.options,
          formData.correctOptionIndex,
          formData.interestId
        );
        toast.success('Question added');
      }
      setIsModalOpen(false);
      const interestId = activeInterest === 'ALL' ? null : activeInterest;
      fetchQuestions(interestId, page);
    } catch (error) {
      toast.error('Failed to save question');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      await deleteQuestion(id);
      toast.success('Question deleted');
      const interestId = activeInterest === 'ALL' ? null : activeInterest;
      fetchQuestions(interestId, page);
    } catch {
      toast.error('Failed to delete question');
    }
  };

  const rows = questions?.content || [];

  return (
    <div>
      <AdminPageHeader title="Questions" count={questions?.totalElements}>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={activeInterest}
            onChange={(e) => { setPage(0); setActiveInterest(e.target.value); }}
            className="w-full sm:w-48"
          >
            <option value="ALL">All Interests</option>
            {interests.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </Select>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </div>
      </AdminPageHeader>

      <div className="overflow-x-auto rounded-lg border border-line mt-6">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-ink/[0.02]">
            <tr>
              {['Interest', 'Question', ''].map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-mute"
                >
                  {h || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-[#FBF8F2]">
            {loading && rows.length === 0 ? (
              <tr><td colSpan="3" className="px-4 py-12 text-center text-accent-500"><Spinner /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="3" className="px-4 py-12 text-center text-sm text-mute">No questions found.</td></tr>
            ) : (
              rows.map((q) => (
                <tr key={q.id} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex items-center rounded-md bg-ink/[0.04] px-2 py-1 text-xs font-medium text-ink ring-1 ring-inset ring-ink/10">
                      {q.interestName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink mb-2">{q.questionText}</div>
                    <ul className="space-y-1">
                      {q.options.map((opt, idx) => (
                        <li 
                          key={idx} 
                          className={`text-xs ${idx === q.correctOptionIndex ? 'font-semibold text-accent-600' : 'text-mute'}`}
                        >
                          {String.fromCharCode(65 + idx)}. {opt}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(q)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {questions?.totalPages > 1 && (
        <Pagination
          page={questions.page ?? page}
          totalPages={questions.totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-b-lg border-x border-b border-line bg-[#FBF8F2]"
        />
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingQuestion ? 'Edit Question' : 'New Question'} size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink">Interest</label>
            <Select
              value={formData.interestId}
              onChange={(e) => setFormData(prev => ({ ...prev, interestId: e.target.value }))}
              required
            >
              <option value="" disabled>Select an interest</option>
              {interests.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </Select>
          </div>
          
          <Input
            label="Question Text"
            value={formData.questionText}
            onChange={(e) => setFormData(prev => ({ ...prev, questionText: e.target.value }))}
            required
            autoFocus
          />

          <div className="space-y-3 mt-4">
            <label className="block text-xs font-medium text-ink">Options</label>
            {[0, 1, 2, 3].map(idx => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctOption"
                  checked={formData.correctOptionIndex === idx}
                  onChange={() => setFormData(prev => ({ ...prev, correctOptionIndex: idx }))}
                  className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-line"
                />
                <span className="font-mono text-xs text-mute w-4">{String.fromCharCode(65 + idx)}</span>
                <Input
                  className="flex-1"
                  placeholder={`Option ${idx + 1}`}
                  value={formData.options[idx]}
                  onChange={(e) => {
                    const newOpts = [...formData.options];
                    newOpts[idx] = e.target.value;
                    setFormData(prev => ({ ...prev, options: newOpts }));
                  }}
                  required
                />
              </div>
            ))}
            <p className="text-[10px] text-mute mt-1">Select the radio button next to the correct answer.</p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={loading}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
