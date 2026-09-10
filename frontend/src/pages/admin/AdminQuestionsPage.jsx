import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileJson, AlertTriangle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';
import toast from 'react-hot-toast';

export default function AdminQuestionsPage() {
  const { questions, interests, fetchInterests, fetchQuestions, createQuestion, updateQuestion, deleteQuestion, deleteAllQuestions, createInterest, loading } = useAdminStore();
  
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

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);

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
    } catch {
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

  const handleDeleteAll = async () => {
    if (deleteAllConfirmText.trim().toUpperCase() !== 'DELETE') return;
    setDeletingAll(true);
    try {
      await deleteAllQuestions();
      toast.success('All questions deleted');
      setIsDeleteAllModalOpen(false);
      setDeleteAllConfirmText('');
      setActiveInterest('ALL');
      setPage(0);
      fetchQuestions(null, 0);
    } catch {
      toast.error('Failed to delete all questions');
    } finally {
      setDeletingAll(false);
    }
  };

  const handleBulkImport = async () => {
    let items;
    try {
      items = JSON.parse(bulkJsonText);
      if (!Array.isArray(items)) throw new Error('JSON must be an array of questions');
    } catch (e) {
      return toast.error(`Invalid JSON: ${e.message}`);
    }
    if (items.length === 0) return toast.error('No questions found in JSON');

    setBulkImporting(true);
    let successCount = 0;
    const errors = [];

    // Seeded from the interests already loaded; grows as new ones are auto-created
    // during this run so later rows referencing the same new name reuse it instead
    // of creating a duplicate.
    const interestByName = new Map(interests.map(i => [i.name.trim().toLowerCase(), i]));
    const startingInterestCount = interestByName.size;
    const parseCategory = (rawType) => {
      const normalized = String(rawType || '').toLowerCase().replace(/[-\s]/g, '');
      return normalized === 'shortterm' ? 'SHORT_TERM' : 'LONG_TERM';
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i] || {};
      const label = item.question ? `"${String(item.question).slice(0, 40)}"` : `item ${i + 1}`;
      try {
        const interestName = String(item.interest || '').trim();
        const interestKey = interestName.toLowerCase();
        if (!interestKey) throw new Error('missing "interest"');

        let interest = interestByName.get(interestKey);
        if (!interest) {
          // First "type" value seen for a brand-new name wins; later rows in this
          // same paste reuse the interest created here regardless of their own type.
          interest = await createInterest(interestName, parseCategory(item.type));
          interestByName.set(interestKey, interest);
        }

        const questionText = String(item.question || '').trim();
        if (!questionText) throw new Error('missing "question" text');

        const rawOptions = Array.isArray(item.options) ? item.options : [];
        if (rawOptions.length !== 4) {
          throw new Error(`expected exactly 4 options, got ${rawOptions.length}`);
        }

        const optionTexts = rawOptions.map(opt => String(typeof opt === 'string' ? opt : opt?.text || '').trim());
        if (optionTexts.some(t => !t)) throw new Error('one or more options have empty text');

        let correctOptionIndex;
        if (rawOptions.every(opt => opt && typeof opt === 'object' && typeof opt.points === 'number')) {
          correctOptionIndex = rawOptions.reduce(
            (maxIdx, opt, idx, arr) => (opt.points > arr[maxIdx].points ? idx : maxIdx),
            0
          );
        } else if (typeof item.correctOptionIndex === 'number') {
          correctOptionIndex = item.correctOptionIndex;
        } else {
          throw new Error('cannot determine correct option (no "points" on options and no "correctOptionIndex")');
        }

        await createQuestion(questionText, optionTexts, correctOptionIndex, interest.id);
        successCount++;
      } catch (err) {
        errors.push(`${label}: ${err.message}`);
      }
    }

    setBulkImporting(false);

    if (interestByName.size > startingInterestCount) {
      fetchInterests();
    }

    if (successCount > 0) {
      toast.success(`Imported ${successCount}/${items.length} questions`);
    }
    if (errors.length > 0) {
      const preview = errors.slice(0, 5).join(' | ');
      const more = errors.length > 5 ? ` (+${errors.length - 5} more)` : '';
      toast.error(`${errors.length} question(s) skipped: ${preview}${more}`, { duration: 8000 });
    }

    if (successCount > 0) {
      setIsBulkModalOpen(false);
      setBulkJsonText('');
      const interestId = activeInterest === 'ALL' ? null : activeInterest;
      fetchQuestions(interestId, page);
    }
  };

  const rows = questions?.content || [];

  return (
    <div>
      <AdminPageHeader title="Questions" count={questions?.totalElements}>
        {/* The filter claims a whole row on a phone; the three actions wrap
            beneath it rather than running off the edge. */}
        <div className="w-full sm:w-48">
          <Select
            value={activeInterest}
            onChange={(e) => { setPage(0); setActiveInterest(e.target.value); }}
            aria-label="Filter by interest"
          >
            <option value="ALL">All Interests</option>
            {interests.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </Select>
        </div>
        <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsBulkModalOpen(true)}>
          <FileJson className="mr-2 h-4 w-4" /> Bulk JSON
        </Button>
        <Button variant="danger" className="flex-1 sm:flex-none" onClick={() => setIsDeleteAllModalOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete All
        </Button>
        <Button className="flex-1 sm:flex-none" onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </AdminPageHeader>

      {/*
        A list, not a table. A question carries its four options with it, so
        every row was already a card wearing a <td> — and at phone width the
        three columns crushed the text into a ribbon while the row actions sat
        off the right edge.
      */}
      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface text-sm">
        {loading && rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-accent-500"><Spinner /></div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-mute">No questions found.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((q) => (
              <li key={q.id} className="p-4 transition-colors hover:bg-ink/[0.02] sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center rounded-md bg-ink/[0.04] px-2 py-1 text-xs font-medium text-ink ring-1 ring-inset ring-ink/10">
                      {q.interestName}
                    </span>
                    <p className="mt-2 font-medium text-ink">{q.questionText}</p>
                  </div>
                  {/* Pinned beside the question at every width. */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit question"
                      onClick={() => handleOpenModal(q)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete question"
                      onClick={() => handleDelete(q.id)}
                      className="text-bad hover:bg-bad/[0.07] hover:text-bad"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <ul className="mt-3 space-y-1">
                  {q.options.map((opt, idx) => (
                    <li
                      key={idx}
                      className={`text-xs ${idx === q.correctOptionIndex ? 'font-semibold text-accent-600' : 'text-mute'}`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {questions?.totalPages > 1 && (
        <Pagination
          page={questions.page ?? page}
          totalPages={questions.totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-b-lg border-x border-b border-line bg-surface"
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

      <Modal open={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="Bulk Import Questions" size="lg">
        <div className="space-y-6">
          <div className="rounded-lg border border-accent-500/20 bg-accent-500/5 p-4">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-accent-700">
              Format Requirements
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/80">
              Paste a JSON array of questions. Each item requires an <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink border border-line">interest</code> name
              (matched case-insensitively — if no interest with that name exists yet, one is created automatically, using <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink border border-line">type</code> ("Long-Term"/"Short-Term") for its category, defaulting to Long-Term), a <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink border border-line">question</code> string, and exactly 4
              <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink border border-line">options</code>. Each option must have <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink border border-line">text</code> and <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink border border-line">points</code>.
              The option with the highest points will be automatically set as the correct answer.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] font-semibold uppercase tracking-widest text-mute">
              JSON Data
            </label>
            <TextArea
              rows={14}
              className="font-mono text-xs placeholder:text-mute/40"
              placeholder={`[\n  {\n    "interest": "Coding & Software Development",\n    "type": "Long-Term",\n    "question_number": 1,\n    "question": "What does API stand for?",\n    "options": [\n      {\n        "label": "A",\n        "text": "Application Programming Interface",\n        "points": 1\n      },\n      {\n        "label": "B",\n        "text": "Applied Program Internet",\n        "points": 0\n      },\n      {\n        "label": "C",\n        "text": "Advanced Protocol Interchange",\n        "points": 0\n      },\n      {\n        "label": "D",\n        "text": "Automated Programming Instruction",\n        "points": 0\n      }\n    ]\n  }\n]`}
              value={bulkJsonText}
              onChange={(e) => setBulkJsonText(e.target.value)}
              style={{ whiteSpace: 'pre', overflowX: 'auto' }}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-mute">
              Malformed items will be skipped and reported.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsBulkModalOpen(false)} disabled={bulkImporting}>Cancel</Button>
              <Button onClick={handleBulkImport} loading={bulkImporting} disabled={!bulkJsonText.trim()}>
                Start Import
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={isDeleteAllModalOpen}
        onClose={() => { if (!deletingAll) { setIsDeleteAllModalOpen(false); setDeleteAllConfirmText(''); } }}
        title="Delete All Questions"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-bad/30 bg-bad/[0.06] p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-bad" />
            <p className="text-xs leading-relaxed text-ink/80">
              This permanently deletes <span className="font-semibold text-ink">every question across every interest</span>,
              regardless of the current filter. This cannot be undone.
            </p>
          </div>

          <Input
            label={'Type "DELETE" to confirm'}
            value={deleteAllConfirmText}
            onChange={(e) => setDeleteAllConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => { setIsDeleteAllModalOpen(false); setDeleteAllConfirmText(''); }}
              disabled={deletingAll}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAll}
              loading={deletingAll}
              disabled={deleteAllConfirmText.trim().toUpperCase() !== 'DELETE'}
            >
              Delete All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
