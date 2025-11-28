# Curriculum Curator: UX Analysis & Phase 1 Fix Plan

**Status:** Critical UX/Workflow Issues Identified
**Date:** November 2024
**Priority:** P0 - Block on Usability

---

## Executive Summary

**Problem:** The codebase has excellent backend architecture and comprehensive features, but the user experience is broken. Users cannot complete the core workflow from login to creating a course with content.

**Root Causes:**
1. **Navigation Confusion** - Multiple competing workflows with unclear entry points
2. **Disconnected Components** - UI components exist but aren't properly connected to working APIs
3. **Missing Integration** - Backend endpoints exist but frontend doesn't call them correctly
4. **Mock Data** - Some critical views use hardcoded mock data instead of real APIs
5. **No Clear Happy Path** - Users don't know which workflow to use

---

## 1. IDEAL USER JOURNEY (FROM PRD)

### The "Golden Path" - Course Creator (Primary Persona: Dr. Sarah Chen)

```
LOGIN
  ↓
DASHBOARD (View existing units)
  ↓
CREATE NEW UNIT (Provide basic details: title, code, pedagogy)
  ↓
UNIT DASHBOARD (Entry point to unit)
  ↓
CHOOSE WORKFLOW:
  Option A: Guided Workflow (Wizard) ← RECOMMENDED FOR NEW USERS
  Option B: Manual Structure Creation
  Option C: Import from PDF
  ↓
[GUIDED WORKFLOW PATH]
  → Answer Questions (Overview, Outcomes, Weekly Plan)
  → AI Generates Structure
  → Review Generated Structure
  → Refine & Approve
  ↓
UNIT STRUCTURE VIEW (See weeks, outcomes, assessments)
  ↓
GENERATE CONTENT PER WEEK
  → Select content type (lecture, worksheet, quiz, etc.)
  → AI generates draft with pedagogy alignment
  → Edit in rich text editor
  → Save with version control
  ↓
EXPORT COURSE
  → PDF, DOCX, SCORM, HTML
  ↓
ITERATE & REFINE (Version control, A/B testing)
```

**Time to First Course (Target):** < 20 hours
**Current Reality:** Impossible - workflow is broken

---

## 2. CURRENT UI STATE ANALYSIS

### What EXISTS and WORKS ✅

#### Backend (95% Complete)
- ✅ Authentication (JWT, email verification, password reset)
- ✅ Units CRUD API (`/api/units`)
- ✅ Unit Structure API (`/api/units/{id}/structure`)
- ✅ Workflow Session API (`/api/content/workflow/sessions/`)
- ✅ LLM Generation API (`/api/llm/generate`, `/api/llm/enhance`)
- ✅ Content Management API (`/api/content`)
- ✅ Import API (`/api/content/import`)
- ✅ Export API (multiple formats)
- ✅ Analytics API
- ✅ Admin API

#### Frontend Components (70% Complete)
- ✅ `UnitManager` - Lists units, create modal works
- ✅ `WorkflowWizard` - Guided workflow component implemented
- ✅ `RichTextEditor` - TipTap editor with pedagogy hints
- ✅ `PedagogySelector` - Teaching philosophy selector
- ✅ `LRDCreator` - Learning Requirements Document creator
- ✅ `ContentCreator` - Content generation interface
- ✅ `Dashboard` - Navigation sidebar

### What's BROKEN or DISCONNECTED ❌

#### Critical Issues

1. **UnitView.tsx**
   - **Status:** Uses hardcoded mock data
   - **Impact:** Cannot view real unit details
   - **Line 22-67:** `fetchCourse()` creates fake data instead of calling API

2. **ContentCreator.tsx**
   - **Status:** Hardcoded localhost URL
   - **Line 27:** `http://localhost:8000/api/llm/generate` - breaks in production
   - **Impact:** Content generation fails in production

3. **Navigation Menu**
   - **Status:** Dead links in sidebar
   - **Dashboard.tsx lines 51-54:** Menu items point to non-existent routes:
     - `/workflow/guided` ← Route doesn't exist
     - `/workflow/manual` ← Route doesn't exist
     - `/workflow/import` ← Route doesn't exist
   - **Impact:** Users click menu items and get 404/nothing happens

4. **Unit Workflow Entry Point**
   - **Status:** Confusing - two similar routes
   - Routes exist:
     - `/units/:id` → `UnitView` (broken, mock data)
     - `/units/:unitId/dashboard` → `UnitWorkflow` (works)
   - **Impact:** Users don't know which one to use

5. **Missing Connections**
   - `UnitManager` creates units but doesn't navigate to workflow
   - No clear "Next Step" after unit creation
   - Content generated but no way to attach to unit structure
   - LRD creation disconnected from content generation

#### Medium Priority Issues

6. **Import Materials**
   - Component exists (`ImportMaterials.tsx`)
   - API exists (`/api/content/import`)
   - But integration incomplete - unclear what happens after import

7. **Material Versioning**
   - Backend has full version control
   - Frontend doesn't expose version history UI
   - Git integration not surfaced

8. **Task List Execution**
   - Backend has task list models
   - No frontend UI to view/execute tasks from LRD

9. **Admin Dashboard**
   - Basic stats work
   - System settings incomplete (backend stubs exist)

---

## 3. MISSING/BROKEN WORKFLOWS

### Workflow Audit

| Workflow | Backend | Frontend | Integration | Status |
|----------|---------|----------|-------------|--------|
| **User Registration** | ✅ | ✅ | ✅ | ✅ Working |
| **Login** | ✅ | ✅ | ✅ | ✅ Working |
| **Create Unit** | ✅ | ✅ | ⚠️ | ⚠️ Partial - no next step |
| **View Unit Details** | ✅ | ❌ | ❌ | ❌ BROKEN - mock data |
| **Guided Workflow** | ✅ | ✅ | ⚠️ | ⚠️ Disconnected from nav |
| **Generate Content** | ✅ | ⚠️ | ❌ | ❌ BROKEN - hardcoded URL |
| **Edit Content** | ✅ | ✅ | ⚠️ | ⚠️ No save/attach to unit |
| **View Unit Structure** | ✅ | ✅ | ✅ | ✅ Working |
| **Create LRD** | ✅ | ✅ | ⚠️ | ⚠️ Disconnected workflow |
| **Import PDF** | ✅ | ✅ | ⚠️ | ⚠️ Unclear post-import |
| **Export Course** | ✅ | ❌ | ❌ | ❌ Missing UI |
| **Version History** | ✅ | ❌ | ❌ | ❌ Missing UI |

**Legend:**
- ✅ Complete and working
- ⚠️ Exists but disconnected/unclear
- ❌ Missing or broken

---

## 4. PROPOSED SIMPLIFIED UX

### Design Principles

1. **Single Clear Entry Point** - Remove competing workflows
2. **Progressive Disclosure** - Show next steps clearly
3. **Wizard-First** - Default to guided workflow for new users
4. **Quick Actions** - Advanced users can skip to direct content creation
5. **Visible Progress** - Always show where user is in the process

### New Information Architecture

```
DASHBOARD
├── My Units (List + Create)
│   └── [Click Unit] → Unit Workspace
│
└── Quick Actions (Sidebar)
    ├── Create New Unit (modal)
    ├── Import Materials
    └── Settings

UNIT WORKSPACE (Main view after creating/opening unit)
├── Header: Unit Name, Code, Status
├── Tabs:
│   ├── Overview (Summary, progress, quick stats)
│   ├── Structure (Weeks, outcomes, assessments) ← DEFAULT TAB
│   ├── Content (Generated materials by week)
│   ├── Settings (Pedagogy, metadata)
│   └── Export (Multi-format export)
│
└── Primary CTA (Context-aware):
    - No structure? → "Start Guided Setup" (WorkflowWizard)
    - Structure exists? → "Add Content to Week X"
    - Content exists? → "Generate Next Material"
```

### Removed/Consolidated Features (Phase 1)

**Remove from Navigation:**
- ❌ "Create Content" standalone (move to unit context)
- ❌ "Teaching Style" standalone (move to unit settings)
- ❌ "AI Assistant" standalone (integrate into content creation)
- ❌ Separate "LRD" routes (integrate into workflow)

**Keep Simple:**
- ✅ Dashboard (unit list)
- ✅ Unit Workspace (tabs)
- ✅ Import (global action)
- ✅ Settings (user preferences, LLM config)

---

## 5. PHASE 1 IMPLEMENTATION SPEC: "MAKE IT WORK"

### Goal
Create a single, working end-to-end workflow: **Login → Create Unit → Generate Structure → Create Content → Export**

### Timeline: 2-3 weeks

---

### TASK BREAKDOWN

#### Week 1: Fix Critical Path

##### Task 1.1: Fix UnitView to Use Real API
**File:** `frontend/src/features/units/UnitView.tsx`
**Changes:**
```typescript
// REPLACE lines 22-67
const fetchCourse = async () => {
  try {
    const response = await api.get(`/api/units/${id}`);
    setUnit(response.data);
  } catch (error) {
    console.error('Failed to fetch unit:', error);
  } finally {
    setLoading(false);
  }
};
```
**Test:** Open existing unit, verify real data displays

---

##### Task 1.2: Fix ContentCreator API URL
**File:** `frontend/src/features/content/ContentCreator.tsx`
**Changes:**
```typescript
// REPLACE line 27 - use relative URL
const eventSource = new EventSource(
  `/api/llm/generate?type=${type}&pedagogy=${pedagogy}&stream=true`
);
```
**Test:** Generate content, verify streaming works

---

##### Task 1.3: Create Unified Unit Workspace Component
**New File:** `frontend/src/features/units/UnitWorkspace.tsx`

**Structure:**
```typescript
// Tabbed interface combining:
// - Unit overview (from UnitView)
// - Structure view (from UnitStructure)
// - Content list (new)
// - Settings (pedagogy, metadata)
// - Export options (new)

const UnitWorkspace = () => {
  const { unitId } = useParams();
  const [activeTab, setActiveTab] = useState('structure');
  const [unit, setUnit] = useState(null);
  const [structure, setStructure] = useState(null);

  // Tabs: overview | structure | content | settings | export

  return (
    <div className="max-w-7xl mx-auto p-6">
      <UnitHeader unit={unit} />
      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'overview' && <OverviewTab unit={unit} />}
      {activeTab === 'structure' && <StructureTab structure={structure} />}
      {activeTab === 'content' && <ContentListTab unitId={unitId} />}
      {activeTab === 'settings' && <SettingsTab unit={unit} />}
      {activeTab === 'export' && <ExportTab unitId={unitId} />}
    </div>
  );
};
```

**Routes to Update (App.tsx):**
```typescript
// REPLACE routes:
<Route path='/units/:unitId' element={<UnitWorkspace />} />
// REMOVE: /units/:id (old UnitView)
// REMOVE: /units/:unitId/dashboard (old UnitWorkflow)
// KEEP: /units/:unitId/structure (for now, redirect to workspace)
```

---

##### Task 1.4: Fix Navigation Menu
**File:** `frontend/src/components/Layout/Dashboard.tsx`
**Changes (lines 44-60):**

```typescript
const menuItems = [
  { icon: LayoutDashboard, label: 'My Units', path: '/units' },
  { icon: Upload, label: 'Import Materials', path: '/import' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

// REMOVE: Create Content, Teaching Style, AI Assistant (integrate into unit workspace)
// REMOVE: Create Unit Structure submenu (trigger from unit workspace)
```

**Navigation should be minimal - focus happens in Unit Workspace**

---

##### Task 1.5: Improve Unit Creation Flow
**File:** `frontend/src/features/units/UnitManager.tsx`
**Changes (lines 88-131):**

```typescript
const createUnit = async () => {
  // ... existing validation ...

  const response = await api.post('/units', unitData);

  // ADD: Navigate to unit workspace with wizard prompt
  navigate(`/units/${response.data.id}?showWizard=true`);

  toast.success('Unit created! Let\'s set up your course structure.');
};
```

---

##### Task 1.6: Auto-Launch Workflow Wizard
**File:** `frontend/src/features/units/UnitWorkspace.tsx` (new)
**Logic:**

```typescript
useEffect(() => {
  // Check if unit has structure
  const checkStructure = async () => {
    const response = await api.get(`/api/units/${unitId}/structure`);
    if (!response.data || !response.data.outline) {
      // No structure - show wizard prompt
      setShowWizardPrompt(true);
    }
  };

  // Also check URL param from unit creation
  const params = new URLSearchParams(window.location.search);
  if (params.get('showWizard') === 'true') {
    setShowWorkflowWizard(true);
  }

  checkStructure();
}, [unitId]);
```

---

#### Week 2: Connect Content Generation to Structure

##### Task 2.1: Add "Generate Content" Action to Structure View
**File:** `frontend/src/components/UnitStructure/UnitStructureView.tsx`

**Add to each week in structure:**
```typescript
<button onClick={() => handleGenerateContent(week.id, 'lecture')}>
  + Generate Lecture
</button>
```

**Handler:**
```typescript
const handleGenerateContent = (weekId, contentType) => {
  // Navigate to ContentCreator with context
  navigate(`/units/${unitId}/content/new?week=${weekId}&type=${contentType}`);
};
```

---

##### Task 2.2: Update ContentCreator to Accept Context
**File:** `frontend/src/features/content/ContentCreator.tsx`

**Add URL params:**
```typescript
const { type } = useParams();
const [searchParams] = useSearchParams();
const weekId = searchParams.get('week');
const unitId = searchParams.get('unitId');

// Pre-fill context from unit/week
useEffect(() => {
  if (unitId && weekId) {
    fetchWeekContext(unitId, weekId);
  }
}, [unitId, weekId]);
```

---

##### Task 2.3: Implement Content Save/Attach
**File:** `frontend/src/features/content/ContentCreator.tsx`

**Replace stub Save button (line 105):**
```typescript
const handleSave = async () => {
  try {
    await api.post('/api/content/create', {
      unitId,
      weekId,
      type,
      content,
      pedagogyType: pedagogy,
    });
    toast.success('Content saved!');
    navigate(`/units/${unitId}?tab=content`);
  } catch (error) {
    toast.error('Failed to save content');
  }
};
```

---

##### Task 2.4: Create Content List View
**New Component:** `frontend/src/features/units/tabs/ContentListTab.tsx`

**Purpose:** Show all generated content for this unit, organized by week

```typescript
const ContentListTab = ({ unitId }) => {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      const response = await api.get(`/api/units/${unitId}/materials`);
      setMaterials(response.data);
    };
    fetchMaterials();
  }, [unitId]);

  return (
    <div>
      {materials.map(material => (
        <MaterialCard
          key={material.id}
          material={material}
          onEdit={() => navigate(`/materials/${material.id}/edit`)}
        />
      ))}
    </div>
  );
};
```

---

##### Task 2.5: Add Basic Export UI
**New Component:** `frontend/src/features/units/tabs/ExportTab.tsx`

```typescript
const ExportTab = ({ unitId }) => {
  const handleExport = async (format) => {
    try {
      const response = await api.post(`/api/content/export/${unitId}`, {
        format,
      }, {
        responseType: 'blob'
      });

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unit-${unitId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-4">
      <h3>Export Course Materials</h3>
      <div className="grid grid-cols-2 gap-4">
        <ExportButton format="pdf" onClick={handleExport} />
        <ExportButton format="docx" onClick={handleExport} />
        <ExportButton format="html" onClick={handleExport} />
        <ExportButton format="scorm" onClick={handleExport} />
      </div>
    </div>
  );
};
```

---

#### Week 3: Polish & Testing

##### Task 3.1: Add Progress Indicators
**File:** `frontend/src/features/units/UnitWorkspace.tsx`

**Add to header:**
```typescript
<ProgressBar
  total={structure?.weeklyTopics?.length || 0}
  completed={materials.length}
  label="Materials Generated"
/>
```

---

##### Task 3.2: Add Contextual Help/Onboarding
**New Component:** `frontend/src/components/Onboarding/FirstTimeHelper.tsx`

**Show on first unit creation:**
- "Welcome! Let's create your first course"
- Highlight "Start Guided Setup" button
- Tooltip hints throughout wizard

---

##### Task 3.3: Fix Remaining Routes
**File:** `frontend/src/App.tsx`

**Clean up route structure:**
```typescript
// UPDATED Routes for authenticated users
<Routes>
  <Route path='/' element={<Navigate to='/units' replace />} />
  <Route path='/dashboard' element={<Navigate to='/units' replace />} />
  <Route path='/units' element={<UnitManager />} />
  <Route path='/units/:unitId' element={<UnitWorkspace />} />

  {/* Standalone tools */}
  <Route path='/import' element={<ImportMaterials />} />
  <Route path='/settings' element={<Settings />} />

  {/* Admin */}
  <Route path='/admin' element={<AdminDashboard />} />

  <Route path='*' element={<Navigate to='/units' replace />} />
</Routes>
```

**REMOVE:**
- `/content/new` (now context-aware within unit)
- `/teaching-style` (now in unit settings)
- `/ai-assistant` (integrated into content creation)
- All LRD standalone routes (integrated into workflow wizard)

---

##### Task 3.4: End-to-End Testing Checklist

**Test Scenario 1: New User Creates First Course**
1. ✅ Register account
2. ✅ Verify email
3. ✅ Login → see empty unit list
4. ✅ Click "Create Unit" → modal appears
5. ✅ Fill form → unit created
6. ✅ Auto-navigate to unit workspace
7. ✅ See "No structure yet" prompt
8. ✅ Click "Start Guided Setup"
9. ✅ Complete workflow wizard (answer all questions)
10. ✅ See "Structure Generated" success
11. ✅ View structure in Structure tab
12. ✅ Click "Generate Lecture" for Week 1
13. ✅ Content creator opens with context
14. ✅ Click "Generate" → content streams in
15. ✅ Edit content in rich text editor
16. ✅ Click "Save" → content attached to unit
17. ✅ Navigate back to unit → see material in Content tab
18. ✅ Go to Export tab
19. ✅ Click "Export as PDF" → file downloads
20. ✅ Success! 🎉

**Test Scenario 2: Existing User Adds Content to Existing Unit**
1. ✅ Login
2. ✅ See list of units
3. ✅ Click existing unit
4. ✅ See structure already exists
5. ✅ Navigate to Structure tab
6. ✅ Click "Generate Worksheet" for Week 3
7. ✅ Content generates and saves
8. ✅ View in Content tab

**Test Scenario 3: User Imports PDF**
1. ✅ Login
2. ✅ Click "Import Materials" in sidebar
3. ✅ Upload PDF
4. ✅ See analysis/preview
5. ✅ Content extracted and available for enhancement

---

##### Task 3.5: Update Documentation
**File:** `docs/USER-GUIDE.md` (new)

Create simple user guide:
1. Getting Started
2. Creating Your First Course
3. Using the Guided Workflow
4. Generating Content
5. Exporting Materials
6. Tips & Tricks

---

##### Task 3.6: Performance & Error Handling

**Add throughout:**
- Loading states for all async operations
- Error boundaries for component failures
- Toast notifications for user feedback
- Retry logic for failed API calls
- Offline detection and messaging

---

## 6. SUCCESS METRICS FOR PHASE 1

### Quantitative Metrics
- [ ] User can complete full workflow in < 1 hour (target: 30 min)
- [ ] Zero navigation dead-ends (all menu items work)
- [ ] Content generation success rate > 95%
- [ ] API error rate < 1%
- [ ] Page load time < 2 seconds

### Qualitative Metrics
- [ ] New user can create first unit without documentation
- [ ] Navigation makes sense (< 2 clicks to any feature)
- [ ] "Next step" is always obvious
- [ ] No confusion about which workflow to use
- [ ] Error messages are helpful and actionable

### Technical Debt Addressed
- [ ] No hardcoded URLs in frontend
- [ ] No mock data in production code
- [ ] All navigation menu items functional
- [ ] APIs properly connected to UI
- [ ] Consistent error handling

---

## 7. OUT OF SCOPE FOR PHASE 1

**Defer to Phase 2:**
- ❌ Version history UI
- ❌ Collaboration features
- ❌ Advanced analytics dashboard
- ❌ Template marketplace
- ❌ A/B testing of content
- ❌ Automated quality scoring
- ❌ Plugin system UI
- ❌ LRD standalone workflow (integrated into wizard)
- ❌ Task list execution UI
- ❌ Git diff visualization
- ❌ Quarto preview/configuration
- ❌ Advanced admin settings

**Keep for Phase 2:**
- All backend functionality (it works!)
- Database models (complete)
- Plugin validators (functional)
- Git storage (working)
- Workflow services (solid)

---

## 8. IMPLEMENTATION STRATEGY

### Development Approach
1. **Fix, Don't Rebuild** - Keep existing components, just connect them properly
2. **Progressive Enhancement** - Make core workflow work first, polish later
3. **Test Each Task** - Verify end-to-end flow after each task
4. **Document as You Go** - Update this plan with discoveries

### Risk Mitigation
- **Backup branch before changes** - `git checkout -b phase1-ux-fixes`
- **Test on VPS frequently** - Deploy to staging environment
- **Keep old routes temporarily** - Comment out, don't delete (easy rollback)
- **User testing after Week 1** - Get feedback on critical path

### Team Communication
- Daily standup: "Did yesterday's task work end-to-end?"
- Weekly demo: Show working workflow on staging
- Document blockers immediately in this file

---

## 9. ROLLOUT PLAN

### Deployment Sequence
1. **Week 1 End:** Deploy critical fixes to staging
2. **Week 2 Middle:** Internal user testing (educator persona)
3. **Week 2 End:** Deploy to production with beta flag
4. **Week 3:** Monitor, fix bugs, gather feedback
5. **Week 3 End:** Enable for all users

### Rollback Plan
- Keep old components in codebase (commented)
- Feature flag for new Unit Workspace
- Database migrations are backward-compatible
- Can revert frontend independently of backend

---

## 10. BEYOND PHASE 1: FUTURE ENHANCEMENTS

**Phase 2 Ideas (Post-MVP):**
- Material templates library
- Bulk content generation (entire week at once)
- AI-suggested improvements based on analytics
- Collaborative editing (multiple educators)
- Student preview mode
- Integration with LMS (Canvas, Moodle, Blackboard)
- Mobile app for content review
- Voice-to-content generation
- Accessibility scoring and auto-fixes

---

## CONCLUSION

The Curriculum Curator codebase is architecturally excellent but suffers from UX fragmentation. This plan focuses on:

1. **Simplifying navigation** - Remove competing workflows
2. **Creating a clear golden path** - Login → Unit → Workflow → Content → Export
3. **Connecting existing pieces** - Frontend and backend both work, just need glue
4. **Progressive disclosure** - Advanced features available but not in your face

**Estimated Effort:** 2-3 weeks for a working MVP
**Complexity:** Medium (mostly integration, not new development)
**Risk:** Low (backend is solid, just fixing frontend connections)

Once Phase 1 is complete, the platform will be **immediately usable** for its core purpose: helping educators create pedagogically-aligned course materials with AI assistance.

---

**Next Steps:**
1. Review this plan with team
2. Create GitHub issues for each task
3. Start with Week 1, Task 1.1
4. Deploy frequently to staging
5. Test the full workflow after each week
6. Iterate based on feedback

**Questions? Blockers? Update this document as you go!**
