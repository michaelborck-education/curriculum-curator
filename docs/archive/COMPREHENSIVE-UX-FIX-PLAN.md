# Curriculum Curator: Comprehensive UX Fix & Implementation Plan

**Status:** Critical - UX Broken, Features Disconnected
**Date:** November 2024
**Updated:** After Memory Refresh Session
**Priority:** P0 - Blocking Production Use

---

## Executive Summary

### The Problem
**Backend is 85% complete** with sophisticated features, but **frontend integration is 40%** complete. Users cannot:
- Complete the core workflow (login → course → content → export)
- Access implemented features (validators, assessments, market research)
- Understand which path to take (too many competing workflows)

### The Vision (Your Original Design)
A pedagogically-aware LMS authoring tool that moves educators from "blank page" to fully structured, aligned course with:
- **Pedagogical DNA**: Teaching philosophy detection via quiz or manual selection
- **Market Research**: AI-powered course benchmarking
- **Intelligent Generation**: Context-aware content with philosophy overrides
- **Quality Assurance**: Validator agents with auto-fix remediation
- **Outcome Alignment**: ULO management with Bloom's taxonomy and assessment dashboards

### The Reality (Current Code State)
- ✅ Backend: Models, APIs, services 85% complete
- ⚠️ Frontend: Components exist but disconnected (40% complete)
- ❌ Integration: Critical workflows broken or missing
- ❌ UX: No clear path, confusing navigation

---

## Part 1: Feature Inventory - What EXISTS vs What WORKS

### 1.1 Pedagogical DNA System

| Component | Your Memory | Code Reality | Status |
|-----------|-------------|--------------|--------|
| **Teaching Philosophy Quiz** | 5-question quiz that calculates best match | ✅ `TeachingStyle.tsx` lines 136-199<br>Questions exist, scoring logic works | **✅ 95% Complete** |
| **Manual Selection** | Browse 9 styles, pick one | ✅ Same component, lines 17-124<br>All 9 styles defined with descriptions | **✅ Complete** |
| **AI Persona Adaptation** | LLM adapts tone/style based on philosophy | ✅ `llm_service.py` uses pedagogy in prompts<br>✅ 9 prompt templates exist | **✅ Complete** |
| **Philosophy Per-Item Override** | Change style for specific content | ✅ `ContentCreator.tsx` has `PedagogySelector`<br>❌ Not saved/applied to individual materials | **⚠️ 70% - Needs save logic** |

**Gap:** Philosophy overrides not persisted when saving content.

---

### 1.2 Course Structure & Planning

| Component | Your Memory | Code Reality | Status |
|-----------|-------------|--------------|--------|
| **Tabbed Workspace** | Structure, Outcomes, Assessments tabs | ⚠️ `UnitWorkflow.tsx` exists<br>⚠️ `UnitStructureView.tsx` exists<br>❌ Not unified into single tabbed interface | **⚠️ 60% - Fragmented** |
| **Collapsible Sidebar** | Focus mode navigation | ✅ `Dashboard.tsx` has collapsible sidebar<br>✅ Works correctly | **✅ Complete** |
| **12-Week Schedule Generator** | AI generates JSON schedule | ✅ Backend: `WorkflowWizard` service generates structure<br>⚠️ Frontend: `WorkflowWizard.tsx` calls it<br>❌ Not seamlessly integrated | **⚠️ 75% - Connection issues** |
| **Market Research** | Google Search grounding for benchmarking | ❌ Not found in codebase<br>💡 Alternative: AI-powered web search | **❌ 0% - Missing** |

**Gap:** Market research feature doesn't exist. **Proposal:** Implement AI web search tool integration.

---

### 1.3 Content Creation & Management

| Component | Your Memory | Code Reality | Status |
|-----------|-------------|--------------|--------|
| **Context-Aware Generator** | Knows week, previous content, style | ✅ Backend APIs support context<br>❌ Frontend doesn't pass context to generator | **⚠️ 50% - Missing integration** |
| **Content Types** | Lectures, handouts, quizzes, case studies, project briefs | ✅ Backend supports all types<br>✅ ContentCreator has type selector | **✅ Complete** |
| **Australian English** | Enforce AU spelling and conventions | ⚠️ Mentioned in docs<br>❌ Not enforced in code | **❌ 0% - Not implemented** |
| **Rich Text Editor** | TipTap with tables, code blocks | ✅ `RichTextEditor.tsx` fully functional | **✅ Complete** |
| **Save with Versioning** | Git-backed version control | ✅ Backend: `GitContentService` working<br>❌ Frontend: Save button is stub | **⚠️ 50% - Missing save** |

**Gap:** Content save doesn't work, no AU English enforcement.

---

### 1.4 Quality Assurance & Validation

| Component | Your Memory | Code Reality | Status |
|-----------|-------------|--------------|--------|
| **Validator Agents** | Readability, structure, alignment checks | ✅ Backend: 13 validators in `/plugins/`<br>❌ Frontend: No UI to run validators | **Backend ✅, Frontend 0%** |
| **Auto-Fix (Remediation)** | One-click content improvement | ⚠️ Backend: Base classes exist<br>❌ Only basic remediator implemented<br>❌ No frontend UI | **⚠️ 20% - Stubbed** |
| **Check Buttons** | "Check Readability", "Check Structure" | ❌ No UI components exist | **❌ 0% - Missing** |
| **Visual Feedback** | Show issues, severity, suggestions | ❌ No UI for validation results | **❌ 0% - Missing** |

**Gap:** Entire validator/remediator UI missing despite working backend.

**Available Validators:**
1. GrammarValidator ✅
2. SpellChecker ✅
3. ReadabilityValidator ✅
4. StructureValidator ✅
5. AccessibilityValidator ✅
6. InclusiveLanguageValidator ✅
7. ObjectiveAlignmentValidator ✅
8. CodeFormatter ✅
9. TOCGenerator ✅
10. URLVerifier ✅
11. PluginManager ✅
12. BasicRemediator ⚠️ (only one implemented)

---

### 1.5 Learning Outcomes & Assessment

| Component | Your Memory | Code Reality | Status |
|-----------|-------------|--------------|--------|
| **ULO Management** | Define outcomes with Bloom's taxonomy | ✅ Backend: `UnitLearningOutcome` model complete<br>⚠️ Frontend: Basic CRUD exists<br>❌ Bloom's dropdown not implemented | **⚠️ 40% - Missing Bloom's UI** |
| **Drag-and-Drop Reordering** | Tactile curriculum flow adjustment | ⚠️ `@dnd-kit` library installed<br>❌ Not implemented in any component | **❌ 0% - Not implemented** |
| **Assessment Creation** | Define type, weight, criteria | ✅ Backend: Full `Assessment` model with:<br>- Formative/Summative types<br>- Weight (0-100)<br>- Categories (quiz, exam, project, etc.)<br>- Rubrics, due dates, submissions<br>❌ Frontend: No assessment UI | **Backend ✅, Frontend 0%** |
| **Visual Dashboard** | Formative vs. Summative split<br>Total weight calculation | ❌ No dashboard component exists | **❌ 0% - Missing** |
| **ULO-Assessment Mapping** | Link outcomes to assessments | ✅ Backend: Many-to-many relationship exists<br>❌ Frontend: No mapping UI | **Backend ✅, Frontend 0%** |

**Gap:** Entire assessment system backend is ready but no frontend UI.

---

### 1.6 Export & Output

| Component | Your Memory | Code Reality | Status |
|-----------|-------------|--------------|--------|
| **Multi-format Export** | PDF, DOCX, SCORM, HTML | ✅ Backend: Export APIs exist<br>❌ Frontend: No export UI | **Backend ✅, Frontend 0%** |
| **Quarto Integration** | Render Markdown to presentations | ✅ Backend: `QuartoService` exists<br>❌ Not exposed in UI | **Backend ✅, Frontend 0%** |
| **Version Control Export** | Export specific versions | ✅ Backend: Git storage supports this<br>❌ No UI for version selection | **Backend ✅, Frontend 0%** |

---

## Part 2: The Ideal User Journey (Refined)

### Primary Workflow: "Dr. Sarah Creates Her First Course"

```
STEP 1: ONBOARDING & PEDAGOGICAL DNA
├─ Login/Register
├─ Welcome screen: "Let's discover your teaching style"
├─ Option A: Take 5-question quiz → AI calculates best match
├─ Option B: Browse 9 styles → Manual selection
└─ Result: User's "pedagogical DNA" saved → AI adapts to this style

STEP 2: COURSE PLANNING
├─ Dashboard: "Create New Unit" button
├─ Modal: Enter title, code, basic details
├─ [NEW] Market Research: "Find similar courses" (AI web search)
│   └─ Shows syllabi from AU/international universities
├─ Unit created → Navigate to Unit Workspace

STEP 3: STRUCTURE GENERATION (Guided Workflow)
├─ Unit Workspace opens (tabs: Structure | Content | Outcomes | Assessments | Export)
├─ Prompt: "No structure yet. Start guided setup?"
├─ WorkflowWizard launches:
│   ├─ Questions: Unit overview, target audience, delivery mode
│   ├─ Define 3-5 ULOs with Bloom's taxonomy levels
│   ├─ 12-week topic breakdown
│   └─ Assessment strategy (formative/summative balance)
├─ AI generates structure from answers (JSON)
└─ User reviews → Approve/Refine → Structure saved

STEP 4: DEFINE ASSESSMENTS
├─ Navigate to "Assessments" tab
├─ Create assessments:
│   ├─ Type: Formative or Summative
│   ├─ Category: Quiz, Exam, Project, Paper, etc.
│   ├─ Weight: 0-100% (visual indicator shows total)
│   ├─ Due week, rubric, criteria
│   └─ Map to ULOs (checkboxes)
├─ Visual Dashboard shows:
│   ├─ Formative vs. Summative split (pie chart)
│   ├─ Weight distribution (must equal 100%)
│   └─ ULO coverage (which outcomes are assessed)
└─ Warnings if total ≠ 100% or ULO not assessed

STEP 5: CONTENT GENERATION
├─ Navigate to "Structure" tab
├─ See 12 weeks with topics
├─ For Week 1: Click "Generate Lecture"
│   ├─ ContentCreator opens with:
│   │   ├─ Pre-filled context (week topic, previous content)
│   │   ├─ Default pedagogy (user's style)
│   │   ├─ Option to override per-item
│   │   └─ AI generates draft with streaming
│   ├─ Edit in rich text editor
│   ├─ [NEW] Validate content:
│   │   ├─ Click "Check Readability" → Shows Flesch score, suggestions
│   │   ├─ Click "Check Structure" → Validates heading hierarchy
│   │   ├─ Click "Check Accessibility" → WCAG compliance
│   │   └─ Click "Auto-Fix" → AI remediates issues
│   └─ Save → Attach to Week 1 → Return to Structure tab
├─ Repeat for other weeks and content types
└─ Content tab shows all generated materials organized by week

STEP 6: REFINEMENT & ITERATION
├─ Drag-and-drop to reorder ULOs (affects content alignment)
├─ Version history: View past versions, compare side-by-side
├─ A/B testing: Generate multiple versions, pick best
└─ Git-backed: Every save creates commit, can rollback

STEP 7: EXPORT
├─ Navigate to "Export" tab
├─ Select format:
│   ├─ PDF → Complete course PDF
│   ├─ DOCX → Editable Word documents
│   ├─ SCORM → LMS-ready package
│   ├─ HTML → Static website
│   └─ Quarto → RevealJS presentation
├─ Configure options (include assessments? rubrics?)
└─ Download → Ready to use!
```

**Target Time:** < 20 hours from blank page to complete course

---

## Part 3: Critical Issues & Fixes

### Issue Category 1: BROKEN INTEGRATIONS (P0 - Blocking)

#### Issue 1.1: UnitView Uses Mock Data
**File:** `frontend/src/features/units/UnitView.tsx`
**Problem:** Lines 22-67 create fake hardcoded data instead of calling API
**Impact:** Cannot view real unit details
**Fix:**
```typescript
// REPLACE lines 22-67
const fetchCourse = async () => {
  try {
    const response = await api.get(`/api/units/${id}`);
    setUnit(response.data);
  } catch (error) {
    console.error('Failed to fetch unit:', error);
    toast.error('Failed to load unit');
  } finally {
    setLoading(false);
  }
};
```

---

#### Issue 1.2: ContentCreator Hardcoded Localhost URL
**File:** `frontend/src/features/content/ContentCreator.tsx`
**Problem:** Line 27 uses `http://localhost:8000/api/llm/generate` (breaks in production)
**Impact:** Content generation fails on VPS
**Fix:**
```typescript
// REPLACE line 27 - use relative URL
const eventSource = new EventSource(
  `/api/llm/generate?type=${type}&pedagogy=${pedagogy}&stream=true`
);
```

**Why:** Your Docker setup serves both frontend and backend from same origin. Relative URLs work everywhere.

---

#### Issue 1.3: Content Save Button is Stub
**File:** `frontend/src/features/content/ContentCreator.tsx`
**Problem:** Line 105 Save button has no handler
**Impact:** Cannot save generated content
**Fix:**
```typescript
const handleSave = async () => {
  if (!content || !content.trim()) {
    toast.error('Content is empty');
    return;
  }

  try {
    setSaving(true);
    const response = await api.post('/api/content/create', {
      unitId: searchParams.get('unitId'),
      weekId: searchParams.get('weekId'),
      type,
      title: `${type} - ${searchParams.get('weekTitle') || 'Untitled'}`,
      content,
      pedagogyType: pedagogy,
      status: 'draft',
    });

    toast.success('Content saved successfully!');
    navigate(`/units/${searchParams.get('unitId')}?tab=content`);
  } catch (error) {
    console.error('Save error:', error);
    toast.error('Failed to save content');
  } finally {
    setSaving(false);
  }
};
```

---

#### Issue 1.4: Navigation Menu Dead Links
**File:** `frontend/src/components/Layout/Dashboard.tsx`
**Problem:** Lines 51-54 menu items point to non-existent routes
**Impact:** Users click menu, nothing happens
**Fix:** Simplify navigation (remove broken links, add working ones)
```typescript
// REPLACE lines 44-60
const menuItems = [
  { icon: LayoutDashboard, label: 'My Units', path: '/units' },
  { icon: Upload, label: 'Import Materials', path: '/import' },
  { icon: Target, label: 'Teaching Philosophy', path: '/teaching-style' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];
// Advanced features accessed from within Unit Workspace
```

---

### Issue Category 2: MISSING UI COMPONENTS (P0)

#### Issue 2.1: No Unified Unit Workspace
**Current:** Multiple competing views (UnitView, UnitWorkflow, UnitStructure)
**Problem:** User doesn't know which to use
**Solution:** Create single `UnitWorkspace` with tabs

**New Component:** `frontend/src/features/units/UnitWorkspace.tsx`
```typescript
const UnitWorkspace = () => {
  const { unitId } = useParams();
  const [activeTab, setActiveTab] = useState('structure');

  // Tabs: structure | content | outcomes | assessments | export

  return (
    <div className="max-w-7xl mx-auto p-6">
      <UnitHeader unit={unit} onStartWorkflow={() => setShowWizard(true)} />

      <TabNavigation
        tabs={[
          { id: 'structure', label: 'Structure', icon: Layout },
          { id: 'content', label: 'Content', icon: FileText },
          { id: 'outcomes', label: 'Outcomes', icon: Target },
          { id: 'assessments', label: 'Assessments', icon: CheckSquare },
          { id: 'export', label: 'Export', icon: Download },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'structure' && <StructureTab unitId={unitId} />}
      {activeTab === 'content' && <ContentListTab unitId={unitId} />}
      {activeTab === 'outcomes' && <OutcomesTab unitId={unitId} />}
      {activeTab === 'assessments' && <AssessmentsTab unitId={unitId} />}
      {activeTab === 'export' && <ExportTab unitId={unitId} />}

      {showWizard && <WorkflowWizard ... />}
    </div>
  );
};
```

**Update Routes in App.tsx:**
```typescript
// REPLACE:
<Route path='/units/:unitId' element={<UnitWorkspace />} />
// REMOVE: /units/:id (UnitView)
// REMOVE: /units/:unitId/dashboard (UnitWorkflow)
```

---

#### Issue 2.2: No Assessment Management UI
**Problem:** Full backend exists, zero frontend
**Solution:** Create `AssessmentsTab` component

**New Component:** `frontend/src/features/units/tabs/AssessmentsTab.tsx`
```typescript
const AssessmentsTab = ({ unitId }) => {
  const [assessments, setAssessments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch assessments
  useEffect(() => {
    const fetch = async () => {
      const response = await api.get(`/api/units/${unitId}/assessments`);
      setAssessments(response.data);
    };
    fetch();
  }, [unitId]);

  // Calculate total weight
  const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0);
  const formativeWeight = assessments
    .filter(a => a.type === 'formative')
    .reduce((sum, a) => sum + a.weight, 0);
  const summativeWeight = totalWeight - formativeWeight;

  return (
    <div className="space-y-6">
      <AssessmentDashboard
        total={totalWeight}
        formative={formativeWeight}
        summative={summativeWeight}
      />

      <AssessmentList
        assessments={assessments}
        onEdit={(id) => setEditingId(id)}
        onDelete={(id) => handleDelete(id)}
      />

      <button onClick={() => setShowCreateModal(true)}>
        + Add Assessment
      </button>

      {showCreateModal && (
        <AssessmentCreateModal
          unitId={unitId}
          onSave={(newAssessment) => {
            setAssessments([...assessments, newAssessment]);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};
```

**Dashboard Component:**
```typescript
const AssessmentDashboard = ({ total, formative, summative }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3>Assessment Overview</h3>

      {/* Total Weight Indicator */}
      <div className={`text-2xl font-bold ${total === 100 ? 'text-green-600' : 'text-red-600'}`}>
        Total Weight: {total}%
        {total !== 100 && <span className="text-sm"> (must equal 100%)</span>}
      </div>

      {/* Formative vs. Summative Pie Chart */}
      <PieChart data={[
        { label: 'Formative', value: formative, color: 'bg-blue-500' },
        { label: 'Summative', value: summative, color: 'bg-purple-500' },
      ]} />

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <StatCard label="Formative" value={`${formative}%`} color="blue" />
        <StatCard label="Summative" value={`${summative}%`} color="purple" />
      </div>
    </div>
  );
};
```

---

#### Issue 2.3: No Validator/Remediation UI
**Problem:** 13 validators exist in backend, no way to run them
**Solution:** Add validation panel to ContentCreator

**Update:** `frontend/src/features/content/ContentCreator.tsx`
```typescript
const [validationResults, setValidationResults] = useState(null);
const [isValidating, setIsValidating] = useState(false);

const handleValidate = async (validatorType) => {
  if (!content || !content.trim()) {
    toast.error('Add content first');
    return;
  }

  setIsValidating(true);
  try {
    const response = await api.post('/api/content/validate', {
      content,
      validatorType, // 'readability' | 'structure' | 'accessibility' | 'all'
    });

    setValidationResults(response.data);

    if (response.data.passed) {
      toast.success(`${validatorType} check passed!`);
    } else {
      toast.warning(`${validatorType} check found ${response.data.issues.length} issues`);
    }
  } catch (error) {
    toast.error('Validation failed');
  } finally {
    setIsValidating(false);
  }
};

const handleAutoFix = async () => {
  if (!validationResults || !validationResults.issues) return;

  setIsGenerating(true);
  try {
    const response = await api.post('/api/content/remediate', {
      content,
      issues: validationResults.issues,
    });

    setContent(response.data.fixedContent);
    toast.success('Content auto-fixed!');
    setValidationResults(null); // Clear results after fixing
  } catch (error) {
    toast.error('Auto-fix failed');
  } finally {
    setIsGenerating(false);
  }
};

// Add to UI:
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4">Quality Checks</h3>
  <div className="space-y-2">
    <button
      onClick={() => handleValidate('readability')}
      disabled={isValidating || !content}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {isValidating ? 'Checking...' : 'Check Readability'}
    </button>
    <button
      onClick={() => handleValidate('structure')}
      disabled={isValidating || !content}
      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Check Structure
    </button>
    <button
      onClick={() => handleValidate('accessibility')}
      disabled={isValidating || !content}
      className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
    >
      Check Accessibility
    </button>
    <button
      onClick={() => handleValidate('all')}
      disabled={isValidating || !content}
      className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
    >
      Run All Checks
    </button>
  </div>

  {validationResults && (
    <ValidationResultsPanel
      results={validationResults}
      onAutoFix={handleAutoFix}
      onDismiss={() => setValidationResults(null)}
    />
  )}
</div>
```

---

#### Issue 2.4: No Learning Outcomes with Bloom's Taxonomy
**Problem:** Backend has ULO model with taxonomy levels, no UI
**Solution:** Create OutcomesTab with Bloom's selector and drag-and-drop

**New Component:** `frontend/src/features/units/tabs/OutcomesTab.tsx`
```typescript
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../../../components/Sortable/SortableItem';

const BLOOMS_LEVELS = [
  { value: 'remember', label: 'Remember', color: 'bg-gray-500' },
  { value: 'understand', label: 'Understand', color: 'bg-blue-500' },
  { value: 'apply', label: 'Apply', color: 'bg-green-500' },
  { value: 'analyze', label: 'Analyze', color: 'bg-yellow-500' },
  { value: 'evaluate', label: 'Evaluate', color: 'bg-orange-500' },
  { value: 'create', label: 'Create', color: 'bg-red-500' },
];

const OutcomesTab = ({ unitId }) => {
  const [outcomes, setOutcomes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch outcomes
  useEffect(() => {
    const fetch = async () => {
      const response = await api.get(`/api/units/${unitId}/learning-outcomes`);
      setOutcomes(response.data);
    };
    fetch();
  }, [unitId]);

  // Handle drag-and-drop reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = outcomes.findIndex(o => o.id === active.id);
      const newIndex = outcomes.findIndex(o => o.id === over.id);

      const reordered = arrayMove(outcomes, oldIndex, newIndex);
      setOutcomes(reordered);

      // Save new order to backend
      await api.put(`/api/units/${unitId}/learning-outcomes/reorder`, {
        orderedIds: reordered.map(o => o.id),
      });

      toast.success('Outcomes reordered');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Unit Learning Outcomes (ULOs)</h2>
        <button onClick={() => setShowCreateModal(true)}>
          + Add Outcome
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={outcomes.map(o => o.id)} strategy={verticalListSortingStrategy}>
          {outcomes.map((outcome, index) => (
            <SortableItem key={outcome.id} id={outcome.id}>
              <OutcomeCard
                number={index + 1}
                outcome={outcome}
                onEdit={() => handleEdit(outcome.id)}
                onDelete={() => handleDelete(outcome.id)}
              />
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {showCreateModal && (
        <OutcomeCreateModal
          unitId={unitId}
          onSave={(newOutcome) => {
            setOutcomes([...outcomes, newOutcome]);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

const OutcomeCard = ({ number, outcome, onEdit, onDelete }) => {
  const bloomsLevel = BLOOMS_LEVELS.find(b => b.value === outcome.bloomsLevel);

  return (
    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500 flex items-start">
      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="ml-4 flex-1">
        <p className="text-lg">{outcome.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-white text-sm ${bloomsLevel?.color}`}>
            {bloomsLevel?.label}
          </span>
          <span className="text-gray-500 text-sm">
            {outcome.assessments?.length || 0} assessments mapped
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-blue-600 hover:text-blue-800">
          Edit
        </button>
        <button onClick={onDelete} className="text-red-600 hover:text-red-800">
          Delete
        </button>
      </div>
    </div>
  );
};
```

---

#### Issue 2.5: No Export UI
**Problem:** Backend has export APIs, no frontend
**Solution:** Create ExportTab with format options

**New Component:** `frontend/src/features/units/tabs/ExportTab.tsx`
```typescript
const ExportTab = ({ unitId }) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  const handleExport = async (format) => {
    setExporting(true);
    setExportFormat(format);

    try {
      const response = await api.post(
        `/api/content/export/${unitId}`,
        { format, includeAssessments: true, includeRubrics: true },
        { responseType: 'blob' }
      );

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unit-${unitId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Export Course Materials</h2>
        <p className="text-gray-600">
          Download your complete course in various formats for distribution or LMS upload.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExportFormatCard
          format="pdf"
          icon={FileText}
          title="PDF Document"
          description="Complete course as a single PDF file"
          onExport={handleExport}
          loading={exporting && exportFormat === 'pdf'}
        />
        <ExportFormatCard
          format="docx"
          icon={FileText}
          title="Word Document"
          description="Editable DOCX format for further customization"
          onExport={handleExport}
          loading={exporting && exportFormat === 'docx'}
        />
        <ExportFormatCard
          format="html"
          icon={Globe}
          title="HTML Website"
          description="Static website with navigation"
          onExport={handleExport}
          loading={exporting && exportFormat === 'html'}
        />
        <ExportFormatCard
          format="scorm"
          icon={Package}
          title="SCORM Package"
          description="LMS-ready SCORM 1.2 package"
          onExport={handleExport}
          loading={exporting && exportFormat === 'scorm'}
        />
        <ExportFormatCard
          format="markdown"
          icon={Code}
          title="Markdown Files"
          description="Individual Markdown files with structure"
          onExport={handleExport}
          loading={exporting && exportFormat === 'markdown'}
        />
        <ExportFormatCard
          format="quarto"
          icon={Presentation}
          title="Quarto Presentation"
          description="RevealJS slides via Quarto"
          onExport={handleExport}
          loading={exporting && exportFormat === 'quarto'}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Export Options</h3>
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          Include assessments and rubrics
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked />
          Include learning outcomes
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Include version history
        </label>
      </div>
    </div>
  );
};
```

---

### Issue Category 3: NEW FEATURES (P1)

#### Feature 3.1: AI-Powered Market Research
**Your Memory:** Google Search grounding for course benchmarking
**Reality:** Not implemented
**Proposal:** Use AI with WebSearch tool instead of Google API

**Why AI Search is Better:**
- ✅ No Google API setup/costs
- ✅ Claude already has WebSearch tool
- ✅ Can summarize and compare results
- ✅ Provides insights, not just links
- ❌ Slightly slower than direct API

**Implementation:**

**Backend:** `backend/app/api/routes/market_research.py` (NEW)
```python
from anthropic import AsyncAnthropic
from app.core.config import settings

@router.post("/market-research/search")
async def research_course_market(
    request: MarketResearchRequest,
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Use Claude with WebSearch to find similar courses
    """
    client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    prompt = f"""
    I'm creating a university course titled "{request.title}" with this description:
    {request.description}

    Please search for similar courses from:
    1. Australian universities (priority)
    2. International universities

    For each course found, provide:
    - University name
    - Course code and title
    - Key topics covered
    - Delivery mode (online/on-campus/hybrid)
    - Assessment structure
    - Link to syllabus if available

    Summarize common patterns and suggest structure for my course.
    """

    response = await client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=4096,
        tools=[{"type": "web_search"}],  # Enable web search
        messages=[{"role": "user", "content": prompt}]
    )

    # Extract text content and tool uses
    text_content = ""
    sources = []

    for block in response.content:
        if block.type == "text":
            text_content += block.text
        elif block.type == "tool_use" and block.name == "web_search":
            # Track search queries used
            sources.append(block.input)

    return {
        "analysis": text_content,
        "sources": sources,
        "suggested_structure": extract_structure_suggestions(text_content)
    }
```

**Frontend:** Add to `UnitWorkspace` header
```typescript
const [showMarketResearch, setShowMarketResearch] = useState(false);

<button
  onClick={() => setShowMarketResearch(true)}
  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
>
  <Search className="w-4 h-4 inline mr-2" />
  Research Similar Courses
</button>

{showMarketResearch && (
  <MarketResearchModal
    unitTitle={unit.title}
    unitDescription={unit.description}
    onApplyStructure={(structure) => {
      // Populate WorkflowWizard with suggestions
      setPrefilledAnswers(structure);
      setShowWorkflowWizard(true);
    }}
    onClose={() => setShowMarketResearch(false)}
  />
)}
```

---

#### Feature 3.2: Australian English Enforcement
**Your Memory:** Hard-coded AU spelling
**Reality:** Not implemented
**Solution:** Add AU English validator + auto-correction

**Backend:** Extend spell checker validator
```python
# backend/app/plugins/spell_checker.py

AU_SPELLING_CORRECTIONS = {
    "analyze": "analyse",
    "behavior": "behaviour",
    "center": "centre",
    "color": "colour",
    "defense": "defence",
    "favor": "favour",
    "honor": "honour",
    "labor": "labour",
    "neighbor": "neighbour",
    "organize": "organise",
    "realize": "realise",
    "recognize": "recognise",
    # ... complete dictionary
}

class AustralianEnglishValidator(BaseValidator):
    """Enforce Australian English spelling"""

    async def validate(self, content: str, context: Dict) -> ValidationResult:
        issues = []

        for us_word, au_word in AU_SPELLING_CORRECTIONS.items():
            if us_word in content.lower():
                issues.append(Issue(
                    severity=IssueSeverity.LOW,
                    category="spelling",
                    message=f"Use Australian spelling: '{au_word}' not '{us_word}'",
                    location=find_word_location(content, us_word),
                    suggestion=au_word
                ))

        return ValidationResult(
            validator_name="australian_english",
            passed=len(issues) == 0,
            issues=issues
        )

class AustralianEnglishRemediator(BaseRemediator):
    """Auto-fix to Australian English"""

    async def remediate(self, content: str, issues: List[Issue]) -> str:
        fixed = content
        for us_word, au_word in AU_SPELLING_CORRECTIONS.items():
            fixed = fixed.replace(us_word, au_word)
            fixed = fixed.replace(us_word.capitalize(), au_word.capitalize())
        return fixed
```

**Frontend:** Add to validator buttons
```typescript
<button onClick={() => handleValidate('australian_english')}>
  Check Australian English
</button>
```

---

## Part 4: Implementation Plan

### Phase 1: Fix Broken Core (Week 1-2) - CRITICAL

**Goal:** Make existing features work

#### Week 1: Critical Fixes
- [ ] Task 1.1: Fix UnitView mock data → real API
- [ ] Task 1.2: Fix ContentCreator hardcoded URL
- [ ] Task 1.3: Implement content save functionality
- [ ] Task 1.4: Fix navigation menu (remove dead links)
- [ ] Task 1.5: Test end-to-end: Create unit → Generate content → Save

#### Week 2: Unify Workspace
- [ ] Task 2.1: Create UnitWorkspace component with tabs
- [ ] Task 2.2: Migrate Structure view to StructureTab
- [ ] Task 2.3: Create ContentListTab (show saved materials)
- [ ] Task 2.4: Update routes in App.tsx
- [ ] Task 2.5: Auto-launch WorkflowWizard after unit creation
- [ ] Task 2.6: Test end-to-end workflow

---

### Phase 2: Add Missing UI (Week 3-5) - HIGH PRIORITY

#### Week 3: Assessments & Outcomes
- [ ] Task 3.1: Create AssessmentsTab with dashboard
- [ ] Task 3.2: Implement assessment CRUD (create, edit, delete)
- [ ] Task 3.3: Build visual weight calculator (must equal 100%)
- [ ] Task 3.4: Create OutcomesTab with Bloom's taxonomy selector
- [ ] Task 3.5: Implement drag-and-drop reordering with @dnd-kit
- [ ] Task 3.6: Add ULO-assessment mapping UI
- [ ] Task 3.7: Test: Create 3 ULOs, 4 assessments, map them

#### Week 4: Quality Assurance
- [ ] Task 4.1: Add validation panel to ContentCreator
- [ ] Task 4.2: Create ValidationResultsPanel component
- [ ] Task 4.3: Implement "Check Readability/Structure/Accessibility" buttons
- [ ] Task 4.4: Add "Auto-Fix" button with remediator API call
- [ ] Task 4.5: Show visual feedback (issues, severity, suggestions)
- [ ] Task 4.6: Test all 13 validators
- [ ] Task 4.7: Implement Australian English validator + remediator
- [ ] Task 4.8: Test: Generate content → Validate → Auto-fix

#### Week 5: Export & Polish
- [ ] Task 5.1: Create ExportTab component
- [ ] Task 5.2: Implement format selection (PDF, DOCX, HTML, SCORM)
- [ ] Task 5.3: Add export options (include assessments, outcomes, etc.)
- [ ] Task 5.4: Test all export formats download correctly
- [ ] Task 5.5: Add progress indicators throughout app
- [ ] Task 5.6: Improve error handling and toast messages

---

### Phase 3: New Features (Week 6-7) - MEDIUM PRIORITY

#### Week 6: Market Research
- [ ] Task 6.1: Create market research backend route
- [ ] Task 6.2: Integrate Claude WebSearch tool
- [ ] Task 6.3: Parse and structure search results
- [ ] Task 6.4: Create MarketResearchModal component
- [ ] Task 6.5: Add "Research Similar Courses" button to Unit header
- [ ] Task 6.6: Prefill WorkflowWizard from research suggestions
- [ ] Task 6.7: Test: Research → Apply suggestions → Generate structure

#### Week 7: Teaching Philosophy Enhancements
- [ ] Task 7.1: Improve quiz UI (progress indicator, visual results)
- [ ] Task 7.2: Add philosophy override per-content-item
- [ ] Task 7.3: Save philosophy override to database
- [ ] Task 7.4: Show philosophy indicator in content list
- [ ] Task 7.5: Test: Quiz → Detect style → Override for one lecture → Verify difference

---

### Phase 4: Advanced Features (Week 8+) - FUTURE

**Defer to Phase 4:**
- Version history UI (backend ready)
- A/B testing interface
- Collaboration (multi-user editing)
- Template marketplace
- Advanced analytics
- Mobile app

---

## Part 5: Testing Checklist

### End-to-End Test: Complete User Journey

**Persona: Dr. Sarah Chen creates "Introduction to Biology"**

#### Test 1: Onboarding & Setup
- [ ] 1. Register account → Verify email → Login
- [ ] 2. See teaching philosophy prompt
- [ ] 3. Take quiz → Answer 5 questions
- [ ] 4. System calculates "Constructivist" as best match
- [ ] 5. Philosophy saved to user profile

#### Test 2: Course Planning
- [ ] 6. Navigate to "My Units" → Empty list
- [ ] 7. Click "Create New Unit" → Modal appears
- [ ] 8. Fill: Title="Intro to Biology", Code="BIO101", Pedagogy="Constructivist"
- [ ] 9. Click "Research Similar Courses"
- [ ] 10. AI searches web → Shows 5 similar syllabi
- [ ] 11. Review suggestions → Click "Apply Structure"
- [ ] 12. Unit created → Navigate to UnitWorkspace

#### Test 3: Structure Generation
- [ ] 13. See prompt: "No structure yet. Start guided setup?"
- [ ] 14. Click "Start" → WorkflowWizard launches
- [ ] 15. Answer questions:
    - Unit overview: "Cell biology fundamentals"
    - Target audience: "1st year undergraduates"
    - Delivery: "Hybrid (online + labs)"
- [ ] 16. Define 3 ULOs with Bloom's levels:
    - "Describe cell structure" (Remember)
    - "Analyze DNA replication" (Analyze)
    - "Design experiment" (Create)
- [ ] 17. AI generates 12-week schedule
- [ ] 18. Review → Approve → Structure saved
- [ ] 19. See structure in Structure tab

#### Test 4: Assessments
- [ ] 20. Navigate to "Assessments" tab
- [ ] 21. Click "+ Add Assessment"
- [ ] 22. Create Quiz:
    - Type: Formative
    - Weight: 10%
    - Due: Week 3
    - Map to ULO 1
- [ ] 23. Create Midterm:
    - Type: Summative
    - Weight: 40%
    - Due: Week 6
    - Map to ULOs 1, 2
- [ ] 24. Create Final Project:
    - Type: Summative
    - Weight: 50%
    - Due: Week 12
    - Map to all ULOs
- [ ] 25. See dashboard: Total=100%, Formative=10%, Summative=90%
- [ ] 26. Visual pie chart shows split

#### Test 5: Content Generation
- [ ] 27. Navigate to "Structure" tab
- [ ] 28. Week 1: "Introduction to Cells" → Click "Generate Lecture"
- [ ] 29. ContentCreator opens with:
    - Pre-filled: Week 1 context
    - Pedagogy: Constructivist (default)
    - Content type: Lecture
- [ ] 30. Click "Generate" → Content streams in (constructivist tone)
- [ ] 31. Edit in rich text editor (add bold, table)
- [ ] 32. Click "Check Readability" → See Flesch score=65 (acceptable)
- [ ] 33. Click "Check Australian English" → Found "analyze" → Should be "analyse"
- [ ] 34. Click "Auto-Fix" → Content corrected
- [ ] 35. Click "Save" → Content attached to Week 1
- [ ] 36. Return to Structure tab → See lecture listed under Week 1

#### Test 6: Outcomes & Drag-and-Drop
- [ ] 37. Navigate to "Outcomes" tab
- [ ] 38. See 3 ULOs listed in order
- [ ] 39. Drag ULO 3 to position 2
- [ ] 40. Order updates → Saved to backend
- [ ] 41. See "3 assessments mapped" indicator on each ULO

#### Test 7: Export
- [ ] 42. Navigate to "Export" tab
- [ ] 43. Select "PDF" → Check "Include assessments" → Click "Export"
- [ ] 44. PDF downloads with:
    - Cover page: Unit title, code
    - Table of contents
    - 12-week structure
    - Week 1 lecture content
    - Assessment descriptions with rubrics
    - Learning outcomes appendix
- [ ] 45. Verify PDF formatting is correct
- [ ] 46. Try DOCX export → Downloads correctly
- [ ] 47. Try SCORM export → ZIP file ready for LMS upload

#### Test 8: Iteration
- [ ] 48. Go back to Week 1 lecture
- [ ] 49. Edit content → Add new section
- [ ] 50. Save → New version created
- [ ] 51. Click "Version History" → See v1 and v2
- [ ] 52. Compare side-by-side → See differences highlighted
- [ ] 53. Rollback to v1 → Content reverts
- [ ] 54. Success! 🎉

---

## Part 6: Success Metrics

### Quantitative
- [ ] Time to complete first course: < 20 hours (target from PRD)
- [ ] Zero navigation dead-ends (all buttons work)
- [ ] Content generation success rate: > 95%
- [ ] Validator accuracy: > 90% (catches real issues)
- [ ] Export success rate: 100% (all formats work)

### Qualitative
- [ ] New user completes onboarding without help
- [ ] "Next step" always obvious
- [ ] Error messages helpful and actionable
- [ ] No confusion about workflows
- [ ] Teaching philosophy feels personalized

### Technical Debt Resolved
- [ ] No hardcoded URLs
- [ ] No mock data in production
- [ ] All navigation items functional
- [ ] All backend APIs have frontend UI
- [ ] Consistent error handling

---

## Part 7: Architecture Decisions

### Decision 1: AI Search vs. Google Search API
**Choice:** AI Search with Claude WebSearch tool

**Rationale:**
- ✅ No API setup/costs
- ✅ Summarizes and compares (not just links)
- ✅ Can extract structured data from syllabi
- ✅ Provides pedagogical insights
- ❌ Slightly slower (2-3 seconds)

**Implementation:** Use existing Claude API, add `tools=[{"type": "web_search"}]`

---

### Decision 2: Single vs. Multi-Page Unit View
**Choice:** Single page with tabs (UnitWorkspace)

**Rationale:**
- ✅ Reduces navigation clicks
- ✅ Maintains context (unit info always visible)
- ✅ Easier to implement breadcrumbs/progress
- ✅ Matches PRD vision of "tabbed workspace"
- ❌ Slightly heavier page load

**Implementation:** Replace 3 separate routes with 1 tabbed component

---

### Decision 3: Validator UI Location
**Choice:** Inline in ContentCreator (right sidebar)

**Rationale:**
- ✅ Immediate feedback while writing
- ✅ Reduces context switching
- ✅ Matches user mental model ("check as I write")
- ❌ Adds complexity to ContentCreator

**Alternative considered:** Separate "Quality Check" tab → Rejected (too many clicks)

---

### Decision 4: Assessment Dashboard Complexity
**Choice:** Simple pie chart + weight indicator (Phase 2)

**Rationale:**
- ✅ Easy to implement
- ✅ Shows critical info (formative/summative split, total weight)
- ✅ Visually obvious when total ≠ 100%
- 🔮 Future: Add ULO coverage heatmap, alignment matrix (Phase 4)

---

## Part 8: Risk Analysis

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI Search too slow | Medium | Medium | Show loading indicator, cache results |
| Validators have false positives | Medium | High | Allow user to dismiss issues, improve prompts |
| Export formats corrupted | High | Low | Test all formats thoroughly, validate output |
| Drag-and-drop not mobile-friendly | Low | High | Provide manual reorder buttons as fallback |

### User Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Teaching quiz misclassifies style | Medium | Medium | Allow manual override, show quiz results |
| Too many validation warnings overwhelm user | Medium | High | Prioritize by severity, batch similar issues |
| Unclear what "Bloom's taxonomy" means | Low | High | Add tooltip explanations, examples |
| Assessment weights confusing | Medium | Medium | Visual calculator, real-time validation |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Feature creep delays launch | High | High | Strict scope control, defer Phase 4 features |
| Users want more export formats | Low | Medium | Document how to add new formats, extensible design |
| Australian English dictionary incomplete | Medium | Medium | Start with top 100 words, community contributions |

---

## Part 9: Deployment Strategy

### Phased Rollout

**Phase 1A: Internal Testing (Week 1-2)**
- Deploy to staging VPS
- Test with 2-3 internal users
- Fix critical bugs
- Verify all workflows end-to-end

**Phase 1B: Beta Launch (Week 3-4)**
- Deploy to production with feature flag
- Invite 10 beta users (educators)
- Gather feedback via in-app surveys
- Monitor analytics (usage patterns, errors)

**Phase 2: Public Launch (Week 5)**
- Enable for all users
- Publish user guide
- Announce on social media / edu communities
- Monitor support requests

---

## Part 10: Documentation Plan

### User Documentation
- [ ] **Getting Started Guide** - 5-minute quickstart
- [ ] **Teaching Philosophy Guide** - Understand the 9 styles
- [ ] **Workflow Tutorial** - Step-by-step first course
- [ ] **Validator Reference** - What each check does
- [ ] **Assessment Design Guide** - Formative vs. summative best practices
- [ ] **Export Format Comparison** - Which format for what use case
- [ ] **FAQ** - Common questions and troubleshooting

### Developer Documentation
- [ ] **Architecture Overview** - Update with new components
- [ ] **API Reference** - Document all endpoints
- [ ] **Component Library** - Storybook for reusable components
- [ ] **Adding Validators** - How to create new validator plugins
- [ ] **Export Format Guide** - How to add new export types
- [ ] **Testing Guide** - How to run and write tests

---

## Part 11: Future Enhancements (Phase 4+)

### Advanced Features (Post-Launch)
- **Collaboration:** Multiple educators co-authoring course
- **Version Diff Visualization:** Git-style diff view
- **Template Marketplace:** Share/sell course templates
- **Student Preview Mode:** See course from student perspective
- **LMS Integration:** Direct publish to Canvas, Moodle, Blackboard
- **Analytics Dashboard:** Track generation usage, validator scores over time
- **AI Suggested Improvements:** Proactive recommendations based on best practices
- **Voice-to-Content:** Dictate lectures, AI transcribes and formats
- **Accessibility Scoring:** Overall WCAG compliance score
- **Multi-Language Support:** Beyond English (Spanish, Mandarin, etc.)

---

## Conclusion

### Summary of Findings
Your memory of the **intended design** is excellent and aligns with the **original PRD**. The codebase has most of the **backend functionality** (85% complete) but is missing **frontend integration** (40% complete).

### Key Gaps Identified
1. ❌ No assessment management UI (backend ready)
2. ❌ No validator/remediation UI (13 validators ready)
3. ❌ No Bloom's taxonomy selector (backend ready)
4. ❌ No drag-and-drop (library installed, not used)
5. ❌ No export UI (backend ready)
6. ❌ No market research feature (needs AI search implementation)
7. ❌ Content save broken (stub button)
8. ❌ UnitView uses mock data (needs API fix)

### Recommended Path Forward
1. **Fix Phase 1 (2 weeks):** Broken core workflows
2. **Build Phase 2 (3 weeks):** Missing UI components
3. **Add Phase 3 (2 weeks):** New features (market research, AU English)
4. **Test thoroughly:** 50+ step end-to-end checklist
5. **Launch beta:** Invite educators, gather feedback
6. **Iterate:** Phase 4 advanced features

**Total Time to Working MVP:** 7-8 weeks

---

## Next Steps

**Immediate Actions:**
1. ✅ Review this plan - confirm it matches your vision
2. ⬜ Decide: Implement yourself or have Claude do it?
3. ⬜ Start with Phase 1, Week 1, Task 1.1
4. ⬜ Test each fix end-to-end before moving to next
5. ⬜ Deploy to staging VPS frequently
6. ⬜ Update this document as you discover more

**Questions to Answer:**
- Should we implement AI search or wait for Google API?
- Priority: Assessments or Validators first?
- Any features from your memory that I missed?

**Ready to start? Let's fix Task 1.1: UnitView mock data!** 🚀
